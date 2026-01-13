import { type NextRequest, NextResponse } from "next/server"
import { getTwilioClient, getTwilioPhoneNumber } from "@/lib/twilio-client"
import { connectDB } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"

// POST /api/twilio/outbound - Make outbound call
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    const client = getTwilioClient()
    const fromNumber = getTwilioPhoneNumber()

    // Create TwiML for outbound call
    const twimlUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/outbound-twiml?message=${encodeURIComponent(message)}`

    // Make the call
    const call = await client.calls.create({
      from: fromNumber,
      to: to,
      url: twimlUrl,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      record: true,
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/recording`,
    })

    // Create call record in database
    const db = await connectDB()
    await db.collection("calls").insertOne({
      callSid: call.sid,
      callerNumber: fromNumber,
      receiverNumber: to,
      status: call.status,
      direction: "outbound",
      startTime: new Date(),
      transcript: message,
      intent: "outbound_notification",
      priority: "medium",
      emergencyDetected: false,
      initiatedBy: user.email,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
    })
  } catch (error) {
    console.error("Error making outbound call:", error)
    return NextResponse.json({ error: "Failed to make outbound call" }, { status: 500 })
  }
}
