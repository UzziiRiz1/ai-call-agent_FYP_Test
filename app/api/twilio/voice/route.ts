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

    if (!verifyTwilioSignature(signature, url, params)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { CallSid, From, To, CallStatus, Direction } = params

    // Create call record in database
    const db = await connectDB()
    await db.collection("calls").insertOne({
      callSid: CallSid,
      callerNumber: From,
      receiverNumber: To,
      status: "in-progress",
      direction: Direction || "inbound",
      startTime: new Date(),
      transcript: "",
      intent: "unknown",
      priority: "medium",
      emergencyDetected: false,
      createdAt: new Date(),
    })

    // Create TwiML response
    const twiml = new VoiceResponse()

    // Gather speech input with AI-powered greeting
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
      "Hello, thank you for calling our medical assistance line. How can I help you today?",
    )

    // If no input, redirect
    twiml.redirect("/api/twilio/voice")

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
