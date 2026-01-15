import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { connectDB } from "@/lib/mongodb"
import { verifyTwilioSignature } from "@/lib/twilio-client"

const VoiceResponse = twilio.twiml.VoiceResponse

// POST /api/twilio/voice - Handle incoming calls
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params = Object.fromEntries(formData)

    // Verify Twilio signature for security
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    // if (!verifyTwilioSignature(signature, url, params)) {
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    const { CallSid, From, To, CallStatus, Direction } = params

    // Create or update call record in database (upsert to handle Twilio retries)
    const db = await connectDB()
    await db.collection("calls").updateOne(
      { callId: CallSid as string },
      {
        $setOnInsert: {
          callId: CallSid as string,
          callSid: CallSid,
          callerNumber: From,
          receiverNumber: To,
          phoneNumber: From as string,
          patientName: "Unknown Caller",
          status: "in-progress",
          direction: Direction || "inbound",
          startTime: new Date(),
          timestamp: new Date(),
          transcript: "",
          intent: "unknown",
          priority: "medium",
          duration: 0,
          aiResponse: "",
          emergencyDetected: false,
          createdAt: new Date(),
        }
      },
      { upsert: true }
    )

    // Create TwiML response
    const twiml = new VoiceResponse()

    // Gather speech input with standard English greeting
    const gather = twiml.gather({
      input: ["speech"],
      action: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/process-speech`,
      method: "POST",
      speechTimeout: "auto",
      speechModel: "phone_call",
      enhanced: true,
      language: "en-US",
    })

    gather.say(
      { voice: "Polly.Joanna-Neural" },
      "Hello, I am your AI Medical Assistant. How can I help you today?",
    )

    // If no input, redirect to itself to loop
    twiml.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/voice`)

    return new NextResponse(twiml.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("Error handling voice call:", error)

    const twiml = new VoiceResponse()
    twiml.say("We apologize, but we are experiencing technical difficulties. Please try again later.")
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  }
}
