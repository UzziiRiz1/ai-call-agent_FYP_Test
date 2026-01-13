import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyTwilioSignature } from "@/lib/twilio-client"

// POST /api/twilio/transcribe - Handle transcription callbacks
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

    const { CallSid, TranscriptionText, TranscriptionStatus } = params

    if (TranscriptionStatus === "completed" && TranscriptionText) {
      const db = await connectDB()

      // Update call with full transcription
      await db.collection("calls").updateOne(
        { callSid: CallSid },
        {
          $set: {
            fullTranscript: TranscriptionText,
            transcriptionStatus: TranscriptionStatus,
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling transcription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
