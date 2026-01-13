import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const callsCollection = db.collection("calls")

    const [totalCalls, activeCalls, completedCalls, emergencyCalls, allCalls] = await Promise.all([
      callsCollection.countDocuments(),
      callsCollection.countDocuments({ status: "active" }),
      callsCollection.countDocuments({ status: "completed" }),
      callsCollection.countDocuments({ emergencyDetected: true }),
      callsCollection.find().toArray(),
    ])

    const totalDuration = allCalls.reduce((sum, call) => sum + (call.duration || 0), 0)
    const averageDuration = allCalls.length > 0 ? Math.round(totalDuration / allCalls.length) : 0

    const intentDistribution = allCalls.reduce(
      (acc, call) => {
        if (call.intent) {
          acc[call.intent] = (acc[call.intent] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      totalCalls,
      activeCalls,
      completedCalls,
      emergencyCalls,
      averageDuration,
      intentDistribution,
    })
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
