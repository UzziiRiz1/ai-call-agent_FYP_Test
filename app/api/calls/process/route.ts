import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { classifyIntent } from "@/lib/ai/intent-classifier"
import { detectEmergency, calculatePriority, getEmergencyContext } from "@/lib/ai/emergency-detector"
import { generateAIResponse, generateFollowUpInstructions } from "@/lib/ai/response-generator"
import { emitCallUpdate } from "@/lib/websocket-server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { callId, transcript } = await request.json()

    if (!callId || !transcript) {
      return NextResponse.json({ error: "Call ID and transcript are required" }, { status: 400 })
    }

    const db = await getDb()
    const callsCollection = db.collection("calls")

    const call = await callsCollection.findOne({ callId })

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    // AI Processing
    const intent = classifyIntent(transcript)
    const emergencyDetected = detectEmergency(transcript)
    const priority = calculatePriority(transcript, emergencyDetected)
    const aiResponse = generateAIResponse(intent, call.patientName, emergencyDetected)
    const followUpInstructions = generateFollowUpInstructions(intent, emergencyDetected)
    const emergencyContext = emergencyDetected ? getEmergencyContext(transcript) : ""

    // Update call with AI analysis
    const updatedCall = {
      transcript,
      intent,
      priority,
      emergencyDetected,
      aiResponse,
      followUpInstructions,
      emergencyContext,
      processedAt: new Date(),
    }

    await callsCollection.updateOne({ callId }, { $set: updatedCall })

    // Emit WebSocket event
    emitCallUpdate("call:updated", {
      ...call,
      ...updatedCall,
      _id: call._id.toString(),
    })

    return NextResponse.json({
      message: "Call processed successfully",
      analysis: {
        intent,
        priority,
        emergencyDetected,
        aiResponse,
        followUpInstructions,
        emergencyContext,
      },
    })
  } catch (error) {
    console.error("[v0] Error processing call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
