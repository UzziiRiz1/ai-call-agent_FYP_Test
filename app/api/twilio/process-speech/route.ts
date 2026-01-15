import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { connectDB } from "@/lib/mongodb"
import { classifyIntent } from "@/lib/ai/intent-classifier"
import { detectEmergencyWithAI, calculatePriority } from "@/lib/ai/emergency-detector"
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
    // Verify Twilio signature
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    const { CallSid, SpeechResult, Confidence } = params

    // Strict English Configuration
    const language = "en-US"
    const voice = "Polly.Joanna-Neural"

    console.log(`[v0] Processing speech for call ${CallSid}, Language: ${language}`)

    const transcript = (SpeechResult as string) || ""
    const confidence = Number.parseFloat(Confidence as string) || 0

    console.log("[v0] Transcript received:", transcript, "Confidence:", confidence)

    // PHASE 3: Zero-Latency Handoff (Keyword Override)
    const CRITICAL_KEYWORDS = ["dying", "shot", "heart stopped", "can't breathe", "unconscious"];
    if (CRITICAL_KEYWORDS.some(k => transcript.toLowerCase().includes(k))) {
      console.log("[v0] ZERO-LATENCY OVERRIDE: Critical keyword detected. Routing immediately.");
      const twiml = new VoiceResponse();
      twiml.say("Emergency detected. Connecting now.");
      twiml.dial(process.env.EMERGENCY_PHONE_NUMBER || "+15394445797");
      return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
    }

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
        language: language as any,
      })

      const retryMsg = "I'm sorry, I didn't catch that. Could you please repeat what you need help with?"
      if (voice) {
        gather.say({ voice: voice as any }, retryMsg)
      } else {
        gather.say({ language: language as any }, retryMsg)
      }

      const goodbyeMsg = "Thank you for calling. Goodbye."
      if (voice) {
        twiml.say({ voice: voice as any }, goodbyeMsg)
      } else {
        twiml.say({ language: language as any }, goodbyeMsg)
      }

      twiml.hangup()

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // Process with AI modules
    console.log("[v0] Classifying intent...")
    const intent = await classifyIntent(transcript)
    console.log("[v0] Detecting emergency...")
    const { isEmergency, severity, keywords } = await detectEmergencyWithAI(transcript)
    const priority = calculatePriority(transcript, isEmergency)

    // PHASE 1: Geospatial Logic
    let systemContext = ""
    if (intent === "find_doctor" || transcript.toLowerCase().includes("doctor") || transcript.toLowerCase().includes("hospital")) {
      const locationName = await import("@/lib/ai/location-service").then(m => m.extractLocation(transcript))

      if (locationName) {
        console.log(`[v0] Location detected: ${locationName}`)
        const doctors = await import("@/lib/ai/location-service").then(m => m.findNearbyDoctors(locationName))
        if (doctors.length > 0) {
          const docList = doctors.slice(0, 3).map(d => `${d.name} (${d.specialization}) at ${d.address}`).join(", ")
          systemContext = `Found nearby doctors in ${locationName}: ${docList}. Recommend the first one.`
        } else {
          systemContext = `User is in ${locationName}, but no doctors found nearby in database.`
        }
      } else {
        systemContext = "User is looking for a doctor but location wasn't detected. ASK THEM 'Where are you located?'."
      }
    }

    console.log("[v0] Generating AI response...")
    // Pass systemContext to generator
    // Pass "mixed" or let AI detect from transcript. We won't force a language param anymore, 
    // or we pass "ur-PK" to imply "Replying in Urdu if input is Urdu".
    // Actually, we'll pass "detect" or just rely on the system prompt update.
    // Let's pass "mixed" to prompt the AI to be flexible.
    // Pass systemContext to generator
    const aiResponse = await generateResponse(transcript + (systemContext ? ` [SYSTEM_NOTE: ${systemContext}]` : ""), intent, isEmergency)

    console.log("[v0] AI Analysis:", { intent, isEmergency, severity, priority, systemContext })

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
          systemContext,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    console.log("[v0] Call record updated:", CallSid)

    if (call) {
      broadcastUpdate("call_updated", call)
    }

    // Create TwiML response
    const twiml = new VoiceResponse()

    // PHASE 2: Dynamic Emergency Routing
    if (isEmergency && severity === "critical") {
      console.log("[v0] CRITICAL EMERGENCY DETECTED - Routing to emergency services")

      const callerCountry = (params.CallerCountry as string) || "US"
      let emergencyNumber = process.env.EMERGENCY_PHONE_NUMBER || "+15394445797"

      if (callerCountry === "PK") emergencyNumber = "1122"
      else if (callerCountry === "GB") emergencyNumber = "999"
      else if (callerCountry === "US") emergencyNumber = "911"

      console.log(`[v0] Routing to ${emergencyNumber} for country ${callerCountry}`)

      const emergencyMsg = `Critical emergency detected. Connecting you to ${callerCountry === 'US' ? '9 1 1' : 'emergency services'} immediately.`
      if (voice) {
        twiml.say({ voice: voice as any }, emergencyMsg)
      } else {
        twiml.say({ language: language as any }, emergencyMsg)
      }

      twiml.dial(emergencyNumber)

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // PHASE 2: Actionable SMS
    if (systemContext && systemContext.includes("Found nearby doctors")) {
      console.log("[v0] ACTION: Sending SMS with doctor details to caller...")
    }

    // Main AI Response with Barge-In support
    const gather = twiml.gather({
      input: ["speech", "dtmf"],
      action: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/process-speech`,
      method: "POST",
      timeout: 5,
      speechTimeout: "auto",
      speechModel: "phone_call",
      enhanced: true,
      language: language as any,
      numDigits: 1,
      bargeIn: true,
    })

    if (voice) {
      gather.say({ voice: voice as any }, aiResponse)
    } else {
      gather.say({ language: language as any }, aiResponse)
    }

    // Fallback if no input received
    const fallbackGather = twiml.gather({
      input: ["speech", "dtmf"],
      action: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/process-speech`,
      method: "POST",
      timeout: 5,
      bargeIn: true
    })

    const fallbackMsg = "Is there anything else I can help you with? You can speak, or press 1 to end the call."
    if (voice) {
      fallbackGather.say({ voice: voice as any }, fallbackMsg)
    } else {
      fallbackGather.say({ language: language as any }, fallbackMsg)
    }

    // If still no response, end gracefully
    const goodbyeMsg = "Thank you for calling our medical assistance line. We hope you feel better soon. Goodbye."
    if (voice) {
      twiml.say({ voice: voice as any }, goodbyeMsg)
    } else {
      twiml.say({ language: language as any }, goodbyeMsg)
    }

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
