import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const callsCollection = db.collection("calls")

    const [totalCalls, totalUsers, recentCalls, intentStats, priorityStats] = await Promise.all([
      callsCollection.countDocuments(),
      db.collection("users").countDocuments(),
      callsCollection.find().sort({ timestamp: -1 }).limit(7).toArray(),
      callsCollection
        .aggregate([
          {
            $group: {
              _id: "$intent",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      callsCollection
        .aggregate([
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ])

    const callsByDay = recentCalls.reduce(
      (acc, call) => {
        const date = new Date(call.timestamp).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      totalCalls,
      totalUsers,
      intentStats: intentStats.reduce(
        (acc, stat) => {
          acc[stat._id] = stat.count
          return acc
        },
        {} as Record<string, number>,
      ),
      priorityStats: priorityStats.reduce(
        (acc, stat) => {
          acc[stat._id] = stat.count
          return acc
        },
        {} as Record<string, number>,
      ),
      callsByDay,
    })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
