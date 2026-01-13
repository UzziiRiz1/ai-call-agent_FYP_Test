import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { classifyIntent } from "@/lib/ai/intent-classifier"
import { detectEmergency, calculatePriority } from "@/lib/ai/emergency-detector"
import { generateAIResponse } from "@/lib/ai/response-generator"
import { emitCallUpdate } from "@/lib/websocket-server"

const SAMPLE_CALLS = [
  {
    patientName: "John Smith",
    phoneNumber: "+1-555-0101",
    transcript:
      "Hi, I need to schedule an appointment with Dr. Johnson for next week. I'm available on Tuesday or Wednesday afternoon.",
  },
  {
    patientName: "Sarah Williams",
    phoneNumber: "+1-555-0102",
    transcript:
      "Hello, I need a prescription refill for my blood pressure medication. I'm running low and need it within the next few days.",
  },
  {
    patientName: "Michael Brown",
    phoneNumber: "+1-555-0103",
    transcript: "I have a question about my recent blood test results. Can someone explain what the numbers mean?",
  },
  {
    patientName: "Emily Davis",
    phoneNumber: "+1-555-0104",
    transcript: "EMERGENCY! I'm having severe chest pain and difficulty breathing. Please help!",
  },
  {
    patientName: "Robert Miller",
    phoneNumber: "+1-555-0105",
    transcript:
      "I'd like to book a follow-up appointment after my surgery last month. The doctor said to check in after 6 weeks.",
  },
]

export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Select a random call from samples
    const sampleCall = SAMPLE_CALLS[Math.floor(Math.random() * SAMPLE_CALLS.length)]

    const db = await getDb()
    const callsCollection = db.collection("calls")

    const callId = `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // AI Processing
    const intent = classifyIntent(sampleCall.transcript)
    const emergencyDetected = detectEmergency(sampleCall.transcript)
    const priority = calculatePriority(sampleCall.transcript, emergencyDetected)
    const aiResponse = generateAIResponse(intent, sampleCall.patientName, emergencyDetected)

    const duration = Math.floor(Math.random() * 180) + 30 // 30-210 seconds

    const newCall = {
      callId,
      patientName: sampleCall.patientName,
      phoneNumber: sampleCall.phoneNumber,
      status: "active",
      intent,
      priority,
      duration: 0,
      transcript: sampleCall.transcript,
      emergencyDetected,
      aiResponse,
      timestamp: new Date(),
    }

    await callsCollection.insertOne(newCall)

    // Emit WebSocket event for new call
    emitCallUpdate("call:new", { ...newCall, _id: newCall._id?.toString() })

    // Simulate call progression
    setTimeout(
      async () => {
        const updatedCall = {
          ...newCall,
          status: "completed",
          duration,
          completedAt: new Date(),
        }

        await callsCollection.updateOne({ callId }, { $set: updatedCall })

        // Emit WebSocket event for completed call
        emitCallUpdate("call:completed", { ...updatedCall, _id: updatedCall._id?.toString() })
      },
      Math.floor(Math.random() * 5000) + 3000,
    ) // Complete after 3-8 seconds

    return NextResponse.json({
      message: "Call simulated successfully",
      call: {
        ...newCall,
        _id: newCall._id?.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error simulating call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
