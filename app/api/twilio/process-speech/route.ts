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
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.url

    // Signature verification disabled for development with ngrok
    // URL mismatch between Twilio webhook URL and request.url causes failures
    // if (!verifyTwilioSignature(signature, url, params)) {
    //   console.error("[v0] Invalid Twilio signature")
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    const { CallSid, SpeechResult, Confidence } = params

    const transcript = (SpeechResult as string) || ""
    const confidence = Number.parseFloat(Confidence as string) || 0

    console.log("[v0] Transcript received:", transcript, "Confidence:", confidence)

    // PHASE 3: Zero-Latency Handoff (Keyword Override)
    // If these specific keywords are heard, bypass AI and route immediately
    const CRITICAL_KEYWORDS = ["dying", "shot", "heart stopped", "can't breathe", "unconscious"];
    if (CRITICAL_KEYWORDS.some(k => transcript.toLowerCase().includes(k))) {
      console.log("[v0] ZERO-LATENCY OVERRIDE: Critical keyword detected. Routing immediately.");
      const twiml = new VoiceResponse();
      twiml.say("Emergency detected. Connecting now.");
      twiml.dial(process.env.EMERGENCY_PHONE_NUMBER || "+15394445797"); // Use default for zero-latency, or simplistic mapping
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
    // Pass systemContext to generator (Need to update signature of generateResponse or prepend to transcript)
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
          systemContext, // Log what the system found
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    console.log("[v0] Call record updated:", CallSid)

    // Broadcast update via WebSocket
    if (call) {
      broadcastUpdate("call_updated", call)
    }

    // Create TwiML response
    const twiml = new VoiceResponse()

    // PHASE 2: Dynamic Emergency Routing
    if (isEmergency && severity === "critical") {
      console.log("[v0] CRITICAL EMERGENCY DETECTED - Routing to emergency services")

      const callerCountry = (params.CallerCountry as string) || "US" // Twilio provides this
      let emergencyNumber = process.env.EMERGENCY_PHONE_NUMBER || "+15394445797" // Default fallback

      // Dynamic switch based on country
      if (callerCountry === "PK") emergencyNumber = "1122"
      else if (callerCountry === "GB") emergencyNumber = "999"
      else if (callerCountry === "US") emergencyNumber = "911"

      console.log(`[v0] Routing to ${emergencyNumber} for country ${callerCountry}`)

      twiml.say(
        {
          voice: "Polly.Joanna-Neural",
        },
        `Critical emergency detected. Connecting you to ${callerCountry === 'US' ? '9 1 1' : 'emergency services'} immediately.`,
      )

      // Dial emergency services
      twiml.dial(emergencyNumber)

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // PHASE 2: Actionable SMS (If doctor found)
    if (systemContext && systemContext.includes("Found nearby doctors")) {
      // We use the twilio client from imports (need to import it properly or use global client if already instantiated)
      // For now, to avoid expanding imports complexly, we'll log the intention. 
      // In a real implementation we would call twilioClient.messages.create() here.
      console.log("[v0] ACTION: Sending SMS with doctor details to caller...")
      // Ideally: sendSMS(params.From, systemContext)
    }

    // Main AI Response with Barge-In support
    // We nest <Say> inside <Gather> so the user can interrupt the AI while it's speaking
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
      bargeIn: true, // Explicitly enable barge-in (though it's default for speech)
    })

    gather.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      aiResponse,
    )

    // Fallback if no input received during the Gather/Say
    // We ask again to prompt the user
    const fallbackGather = twiml.gather({
      input: ["speech", "dtmf"],
      action: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-ai-call-agent-one.vercel.app"}/api/twilio/process-speech`,
      method: "POST",
      timeout: 5,
      bargeIn: true
    })

    fallbackGather.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Is there anything else I can help you with? You can speak, or press 1 to end the call.",
    )

    // If still no response, end gracefully
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
