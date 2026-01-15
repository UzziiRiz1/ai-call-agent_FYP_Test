import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb" // Added ObjectId import
import { getSession } from "@/lib/auth" // Added getSession import

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const db = await getDb()
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching user:", error) // Kept original error logging style
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const updates = await request.json()
    const db = await getDb()

    // If password is being updated, hash it (re-added this logic from original)
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10)
    }

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
        ...(result as any), // Type assertion to bypass strict null check on result properties, handled by !result check above
        _id: result._id.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error updating user:", error) // Kept original error logging style
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const db = await getDb()
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting user:", error) // Kept original error logging style
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
