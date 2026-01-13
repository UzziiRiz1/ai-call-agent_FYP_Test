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

    console.log("[v0] Processing speech input:", params)

    // Verify Twilio signature
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    if (!verifyTwilioSignature(signature, url, params)) {
      console.error("[v0] Invalid Twilio signature")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { CallSid, SpeechResult, Confidence } = params

    const transcript = (SpeechResult as string) || ""
    const confidence = Number.parseFloat(Confidence as string) || 0

    console.log("[v0] Transcript received:", transcript, "Confidence:", confidence)

    if (!transcript || transcript.trim().length === 0) {
      const twiml = new VoiceResponse()

      const gather = twiml.gather({
        input: ["speech"],
        action: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/process-speech`,
        method: "POST",
        timeout: 5,
        speechTimeout: "auto",
        speechModel: "phone_call",
        enhanced: true,
        language: "en-US",
      })

      gather.say(
        {
          voice: "Polly.Joanna-Neural",
        },
        "I'm sorry, I didn't catch that. Could you please repeat what you need help with?",
      )

      twiml.say(
        {
          voice: "Polly.Joanna-Neural",
        },
        "Thank you for calling. Goodbye.",
      )
      twiml.hangup()

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // Process with AI modules
    console.log("[v0] Classifying intent...")
    const intent = await classifyIntent(transcript)
    console.log("[v0] Detecting emergency...")
    const { isEmergency, severity, keywords } = await detectEmergency(transcript)
    const priority = calculatePriority(intent, isEmergency, severity)
    console.log("[v0] Generating AI response...")
    const aiResponse = await generateResponse(intent, isEmergency, transcript)

    console.log("[v0] AI Analysis:", { intent, isEmergency, severity, priority })

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

    console.log("[v0] Call record updated:", CallSid)

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
      console.log("[v0] CRITICAL EMERGENCY DETECTED - Routing to emergency services")

      twiml.say(
        {
          voice: "Polly.Joanna-Neural",
        },
        "I detect this is a critical emergency. I am immediately connecting you to emergency services. Please stay on the line.",
      )

      // Dial emergency services
      twiml.dial(process.env.EMERGENCY_PHONE_NUMBER || "+15394445797")

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      aiResponse,
    )

    const gather = twiml.gather({
      input: ["speech", "dtmf"], // Accept both speech and keypad input
      action: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/process-speech`,
      method: "POST",
      timeout: 5,
      speechTimeout: "auto",
      speechModel: "phone_call",
      enhanced: true,
      language: "en-US",
      numDigits: 1, // If they press a key
    })

    gather.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Is there anything else I can help you with? You can speak, or press 1 to end the call.",
    )

    // If no response, end gracefully
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Thank you for calling our medical assistance line. We hope you feel better soon. Goodbye.",
    )
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("[v0] Error processing speech:", error)

    const twiml = new VoiceResponse()
    twiml.say("I apologize, I'm having trouble processing your request. Please try again later.")
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  }
}
