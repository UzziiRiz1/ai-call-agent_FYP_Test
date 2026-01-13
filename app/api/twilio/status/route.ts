import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyTwilioSignature } from "@/lib/twilio-client"
import { broadcastUpdate } from "@/lib/websocket-server"

// POST /api/twilio/status - Handle call status callbacks
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

    const { CallSid, CallStatus, CallDuration, RecordingUrl, RecordingSid } = params

    const db = await connectDB()

    // Update call with status
    const updateData: any = {
      status: CallStatus,
      updatedAt: new Date(),
    }

    if (CallStatus === "completed") {
      updateData.endTime = new Date()
      updateData.duration = Number.parseInt(CallDuration as string) || 0
    }

    if (RecordingUrl) {
      updateData.recordingUrl = RecordingUrl
      updateData.recordingSid = RecordingSid
    }

    const call = await db
      .collection("calls")
      .findOneAndUpdate({ callSid: CallSid }, { $set: updateData }, { returnDocument: "after" })

    // Broadcast update via WebSocket
    if (call) {
      broadcastUpdate({
        type: "call_updated",
        data: call,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling status callback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
