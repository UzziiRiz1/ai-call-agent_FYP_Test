import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { connectDB } from "@/lib/mongodb"
import { classifyIntent } from "@/lib/ai/intent-classifier"
import { detectEmergency, calculatePriority } from "@/lib/ai/emergency-detector"
import { generateResponse } from "@/lib/ai/response-generator"
import { verifyTwilioSignature } from "@/lib/twilio-client"
import { broadcastUpdate } from "@/lib/websocket-server"

const VoiceResponse = twilio.twiml.VoiceResponse

// POST /api/twilio/process-speech - Process speech input from caller
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params = Object.fromEntries(formData)

    // Verify Twilio signature
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    if (!verifyTwilioSignature(signature, url, params)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { CallSid, SpeechResult, Confidence } = params

    const transcript = SpeechResult as string
    const confidence = Number.parseFloat(Confidence as string) || 0

    // Process with AI modules
    const intent = classifyIntent(transcript)
    const { isEmergency, severity, keywords } = detectEmergency(transcript)
    const priority = calculatePriority(intent, isEmergency, severity)
    const aiResponse = generateResponse(intent, isEmergency, transcript)

    // Update call record
    const db = await connectDB()
    const call = await db.collection("calls").findOneAndUpdate(
      { callSid: CallSid },
      {
        $set: {
          transcript: transcript,
          transcriptConfidence: confidence,
          intent,
          priority,
          emergencyDetected: isEmergency,
          emergencySeverity: severity,
          emergencyKeywords: keywords,
          aiResponse,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    // Broadcast update via WebSocket
    if (call) {
      broadcastUpdate({
        type: "call_updated",
        data: call,
      })
    }

    // Create TwiML response
    const twiml = new VoiceResponse()

    // Handle emergency
    if (isEmergency && severity === "critical") {
      twiml.say(
        {
          voice: "Polly.Joanna-Neural",
        },
        "I detect this is an emergency. I am immediately connecting you to emergency services. Please stay on the line.",
      )

      // Dial emergency services (in production, this would be 911 or medical emergency line)
      twiml.dial(process.env.EMERGENCY_PHONE_NUMBER || "+1234567890")

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // Normal flow - provide AI response
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      aiResponse,
    )

    // Ask if they need anything else
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
      "Is there anything else I can help you with?",
    )

    // If no response, end call
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Thank you for calling. Have a great day. Goodbye.",
    )
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("Error processing speech:", error)

    const twiml = new VoiceResponse()
    twiml.say("I apologize, I did not understand that. Please try again.")
    twiml.redirect("/api/twilio/voice")

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  }
}
