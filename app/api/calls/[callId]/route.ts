import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { callId } = params

    const db = await getDb()
    const call = await db.collection("calls").findOne({ callId })

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    return NextResponse.json({
      call: {
        ...call,
        _id: call._id.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { callId } = params
    const updates = await request.json()

    const db = await getDb()
    const result = await db
      .collection("calls")
      .findOneAndUpdate({ callId }, { $set: { ...updates, updatedAt: new Date() } }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    return NextResponse.json({
      call: {
        ...result,
        _id: result._id.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error updating call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { callId } = params

    const db = await getDb()
    const result = await db.collection("calls").deleteOne({ callId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
