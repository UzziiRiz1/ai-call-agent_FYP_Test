import { getDb } from "../lib/mongodb"
import { hashPassword } from "../lib/auth"

async function initDatabase() {
  try {
    console.log("[v0] Initializing database...")
    console.log("[v0] Connecting to MongoDB...")

    const db = await getDb()

    console.log("[v0] Connected successfully!")

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
      console.log("[v0] ✅ Created admin user: admin@example.com / admin123")
    } else {
      console.log("[v0] ℹ️ Admin user already exists")
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
      console.log("[v0] ✅ Created operator user: operator@example.com / operator123")
    } else {
      console.log("[v0] ℹ️ Operator user already exists")
    }

    // Create calls collection with indexes
    const callsCollection = db.collection("calls")
    await callsCollection.createIndex({ callId: 1 }, { unique: true })
    await callsCollection.createIndex({ status: 1 })
    await callsCollection.createIndex({ timestamp: -1 })
    await callsCollection.createIndex({ emergencyDetected: 1 })

    console.log("[v0] ✅ Database indexes created")

    // Create sample calls for demo
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
          transcript: "Hello, I'd like to schedule a follow-up appointment with Dr. Smith for my annual physical exam.",
          emergencyDetected: false,
          aiResponse:
            "Hello Alice Johnson, thank you for calling about scheduling an appointment. I can help you with that. Our office hours are Monday through Friday, 9 AM to 5 PM. What type of appointment are you looking to schedule, and do you have a preferred date and time?",
          timestamp: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3400000),
        },
        {
          callId: "CALL-DEMO-002",
          patientName: "Bob Martinez",
          phoneNumber: "+1-555-0202",
          status: "completed",
          intent: "prescription",
          priority: "high",
          duration: 95,
          transcript: "I need to refill my diabetes medication. I'm running out and need it as soon as possible.",
          emergencyDetected: false,
          aiResponse:
            "Hello Bob Martinez, I understand you're calling about a prescription. I'll need some information to assist you. Could you please provide the medication name and the prescribing doctor? I'll check our system and help coordinate with the pharmacy for your refill.",
          timestamp: new Date(Date.now() - 7200000),
          completedAt: new Date(Date.now() - 7100000),
        },
        {
          callId: "CALL-DEMO-003",
          patientName: "Carol White",
          phoneNumber: "+1-555-0203",
          status: "completed",
          intent: "emergency",
          priority: "critical",
          duration: 45,
          transcript: "Help! My father is having severe chest pain and trouble breathing!",
          emergencyDetected: true,
          aiResponse:
            "EMERGENCY ALERT for Carol White. This call has been flagged as critical and requires immediate attention. Emergency services should be contacted if not already done. Medical staff should respond within 2 minutes.",
          timestamp: new Date(Date.now() - 10800000),
          completedAt: new Date(Date.now() - 10755000),
        },
      ]

      await callsCollection.insertMany(sampleCalls)
      console.log("[v0] ✅ Created sample calls for demo")
    } else {
      console.log("[v0] ℹ️ Sample calls already exist")
    }

    console.log("[v0] ✅ Database initialization complete!")
  } catch (error) {
    console.error("[v0] ❌ Error initializing database:", error)
    throw error
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
