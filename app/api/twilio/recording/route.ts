import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyTwilioSignature } from "@/lib/twilio-client"

// POST /api/twilio/recording - Handle recording callbacks
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

    const { CallSid, RecordingSid, RecordingUrl, RecordingDuration } = params

    const db = await connectDB()

    // Update call with recording information
    await db.collection("calls").updateOne(
      { callSid: CallSid },
      {
        $set: {
          recordingSid: RecordingSid,
          recordingUrl: RecordingUrl,
          recordingDuration: Number.parseInt(RecordingDuration as string) || 0,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling recording callback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
