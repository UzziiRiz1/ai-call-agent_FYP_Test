import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

const VoiceResponse = twilio.twiml.VoiceResponse

// GET /api/twilio/outbound-twiml - Generate TwiML for outbound calls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const message = searchParams.get("message") || "This is an automated call from our medical assistance system."

    const twiml = new VoiceResponse()

    // Say the message
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      message,
    )

    // Gather response if needed
    const gather = twiml.gather({
      input: ["speech"],
      action: "/api/twilio/process-speech",
      method: "POST",
      speechTimeout: "auto",
      speechModel: "phone_call",
      enhanced: true,
      language: "en-US",
    })

    gather.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "If you need assistance, please speak now.",
    )

    // End call if no response
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Thank you. Goodbye.",
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
