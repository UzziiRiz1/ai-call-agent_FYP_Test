import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const db = await getDb()
    const callsCollection = db.collection("calls")

    const query = status ? { status } : {}

    const calls = await callsCollection.find(query).sort({ timestamp: -1 }).limit(limit).toArray()

    return NextResponse.json({
      calls: calls.map((call) => ({
        ...call,
        _id: call._id.toString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching calls:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { patientName, phoneNumber, transcript } = body

    if (!patientName || !phoneNumber) {
      return NextResponse.json({ error: "Patient name and phone number are required" }, { status: 400 })
    }

    const db = await getDb()
    const callsCollection = db.collection("calls")

    const callId = `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newCall = {
      callId,
      patientName,
      phoneNumber,
      status: "pending",
      intent: "general_inquiry",
      priority: "low",
      duration: 0,
      transcript: transcript || "",
      emergencyDetected: false,
      aiResponse: "",
      timestamp: new Date(),
    }

    const result = await callsCollection.insertOne(newCall)

    return NextResponse.json({
      call: {
        ...newCall,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error creating call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
