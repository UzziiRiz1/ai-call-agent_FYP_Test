import { type NextRequest, NextResponse } from "next/server"
import { getTwilioClient, getTwilioPhoneNumber } from "@/lib/twilio-client"
import { connectDB } from "@/lib/mongodb"

// POST /api/twilio/outbound - Make outbound call
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Outbound call request received")

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { to, message, patientName } = body

    if (!to || !message) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    // Ensure phone number has country code
    let phoneNumber = to.trim()
    if (!phoneNumber.startsWith("+")) {
      // Assume Pakistan if no country code
      phoneNumber = "+92" + phoneNumber.replace(/^0+/, "")
      console.log("[v0] Added country code:", phoneNumber)
    }

    console.log("[v0] Initializing Twilio client")
    const client = getTwilioClient()
    const fromNumber = getTwilioPhoneNumber()
    console.log("[v0] From number:", fromNumber)
    console.log("[v0] To number:", phoneNumber)

    // Create TwiML for outbound call
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const twimlUrl = `${appUrl}/api/twilio/outbound-twiml?message=${encodeURIComponent(message)}&name=${encodeURIComponent(patientName || "Patient")}`

    console.log("[v0] TwiML URL:", twimlUrl)

    // Make the call
    console.log("[v0] Creating Twilio call...")
    const call = await client.calls.create({
      from: fromNumber,
      to: phoneNumber,
      url: twimlUrl,
      statusCallback: `${appUrl}/api/twilio/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      record: true,
      recordingStatusCallback: `${appUrl}/api/twilio/recording`,
    })

    console.log("[v0] Call created:", call.sid, "Status:", call.status)

    // Create call record in database
    const db = await connectDB()
    await db.collection("calls").insertOne({
      callSid: call.sid,
      callerNumber: fromNumber,
      receiverNumber: phoneNumber,
      patientName: patientName || "Patient",
      status: call.status,
      direction: "outbound",
      startTime: new Date(),
      transcript: message,
      intent: "outbound_notification",
      priority: "medium",
      emergencyDetected: false,
      location: "N/A",
      createdAt: new Date(),
    })

    console.log("[v0] Call record saved to database")

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
    })
  } catch (error: any) {
    console.error("[v0] Error making outbound call:", error)
    console.error("[v0] Error details:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to make outbound call",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
