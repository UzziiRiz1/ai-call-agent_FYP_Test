import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Setup: Initializing database...")

    const db = await getDb()

    // Create users collection with indexes
    const usersCollection = db.collection("users")
    await usersCollection.createIndex({ email: 1 }, { unique: true })

    // Create default admin user
    const adminExists = await usersCollection.findOne({ email: "admin@example.com" })

    if (!adminExists) {
      const hashedPassword = await hashPassword("admin123")
      await usersCollection.insertOne({
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
        createdAt: new Date(),
      })
      console.log("[v0] Setup: Created admin user")
    }

    // Create operator user
    const operatorExists = await usersCollection.findOne({ email: "operator@example.com" })

    if (!operatorExists) {
      const hashedPassword = await hashPassword("operator123")
      await usersCollection.insertOne({
        email: "operator@example.com",
        password: hashedPassword,
        name: "Operator User",
        role: "operator",
        createdAt: new Date(),
      })
      console.log("[v0] Setup: Created operator user")
    }

    // Create calls collection with indexes
    const callsCollection = db.collection("calls")
    await callsCollection.createIndex({ callId: 1 }, { unique: true })
    await callsCollection.createIndex({ status: 1 })
    await callsCollection.createIndex({ timestamp: -1 })

    // Create sample calls
    const sampleCallsExist = await callsCollection.countDocuments()

    if (sampleCallsExist === 0) {
      const sampleCalls = [
        {
          callId: "CALL-DEMO-001",
          patientName: "Alice Johnson",
          phoneNumber: "+1-555-0201",
          status: "completed",
          intent: "appointment",
          priority: "medium",
          duration: 120,
          transcript: "Hello, I'd like to schedule a follow-up appointment with Dr. Smith.",
          emergencyDetected: false,
          aiResponse: "I can help you schedule an appointment. What date works best for you?",
          timestamp: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3400000),
        },
      ]

      await callsCollection.insertMany(sampleCalls)
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully. You can now log in with admin@example.com / admin123",
    })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json(
      { error: `Setup failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
