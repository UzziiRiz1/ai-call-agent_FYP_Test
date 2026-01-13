import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

const VoiceResponse = twilio.twiml.VoiceResponse

// GET /api/twilio/outbound-twiml - Generate TwiML for outbound calls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const message = searchParams.get("message") || "This is an automated call from our medical assistance system."
    const callSid = searchParams.get("callSid")
    const name = searchParams.get("name")

    console.log("[v0] Generating outbound TwiML for call:", callSid)

    const twiml = new VoiceResponse()

    // Personalized greeting if name is provided
    const greeting = name ? `Hello ${name}, ${message}` : message

    // Say the initial message
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      greeting,
    )

    const gather = twiml.gather({
      input: ["speech"],
      action: "/api/twilio/process-speech",
      method: "POST",
      timeout: 5, // Wait 5 seconds for response
      speechTimeout: "auto", // Auto-detect when patient stops speaking
      speechModel: "phone_call",
      enhanced: true,
      language: "en-US",
    })

    // Ask open-ended question to allow patient to speak
    gather.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Please tell me how I can assist you today.",
    )

    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "I didn't hear anything. If you need assistance, please call us back. Goodbye.",
    )
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("Error generating outbound TwiML:", error)

    const twiml = new VoiceResponse()
    twiml.say("An error occurred. Goodbye.")
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  }
}
