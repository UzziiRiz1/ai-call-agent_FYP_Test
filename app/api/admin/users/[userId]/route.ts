import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession, hashPassword } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const updates = await request.json()

    if (updates.password) {
      updates.password = await hashPassword(updates.password)
    }

    const db = await getDb()
    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after", projection: { password: 0 } },
      )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...result,
        _id: result._id.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    if (session.userId === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
