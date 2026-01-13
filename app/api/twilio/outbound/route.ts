import { type NextRequest, NextResponse } from "next/server"
import { getTwilioClient, getTwilioPhoneNumber } from "@/lib/twilio-client"
import { connectDB } from "@/lib/mongodb"

// POST /api/twilio/outbound - Make outbound call
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ========== OUTBOUND CALL START ==========")
    console.log("[v0] Outbound call request received")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { to, message, patientName } = body

    if (!to || !message) {
      console.log("[v0] Missing required fields - to:", to, "message:", message)
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    let phoneNumber = to.trim()
    console.log("[v0] Original phone number:", phoneNumber)

    if (!phoneNumber.startsWith("+")) {
      // Assume Pakistan if no country code
      phoneNumber = "+92" + phoneNumber.replace(/^0+/, "")
      console.log("[v0] Formatted with Pakistan code:", phoneNumber)
    }

    console.log("[v0] Initializing Twilio client")
    let client, fromNumber
    try {
      client = getTwilioClient()
      fromNumber = getTwilioPhoneNumber()
      console.log("[v0] Twilio client initialized successfully")
      console.log("[v0] From number:", fromNumber)
      console.log("[v0] To number:", phoneNumber)
    } catch (twilioError: any) {
      console.error("[v0] Twilio initialization error:", twilioError.message)
      return NextResponse.json(
        {
          error: "Twilio configuration error",
          details: twilioError.message,
        },
        { status: 500 },
      )
    }

    // Create TwiML for outbound call
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://v0-ai-call-agent-one.vercel.app"

    const twimlUrl = `${appUrl}/api/twilio/outbound-twiml?message=${encodeURIComponent(message)}&name=${encodeURIComponent(patientName || "Patient")}`

    console.log("[v0] App URL:", appUrl)
    console.log("[v0] TwiML URL:", twimlUrl)

    console.log("[v0] Creating Twilio call...")
    let call
    try {
      call = await client.calls.create({
        from: fromNumber,
        to: phoneNumber,
        url: twimlUrl,
        statusCallback: `${appUrl}/api/twilio/status`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        record: true,
        recordingStatusCallback: `${appUrl}/api/twilio/recording`,
      })
      console.log("[v0] Call created successfully:", call.sid, "Status:", call.status)
    } catch (callError: any) {
      console.error("[v0] Twilio call creation error:", callError.message)
      console.error("[v0] Error code:", callError.code)
      console.error("[v0] Error status:", callError.status)
      return NextResponse.json(
        {
          error: "Failed to create Twilio call",
          details: `${callError.message} (Code: ${callError.code || "unknown"})`,
        },
        { status: 500 },
      )
    }

    try {
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
    } catch (dbError: any) {
      console.error("[v0] Database error (non-fatal):", dbError.message)
      // Don't fail the request if database save fails
    }

    console.log("[v0] ========== OUTBOUND CALL SUCCESS ==========")
    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
    })
  } catch (error: any) {
    console.error("[v0] ========== OUTBOUND CALL ERROR ==========")
    console.error("[v0] Error making outbound call:", error)
    console.error("[v0] Error message:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to make outbound call",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
