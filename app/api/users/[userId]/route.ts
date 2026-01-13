import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const db = await getDb()
    const userModel = new UserModel(db)

    const user = await userModel.findById(params.userId)

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...sanitizedUser } = user

    return NextResponse.json({ success: true, user: sanitizedUser })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  try {
    const body = await request.json()
    const db = await getDb()
    const userModel = new UserModel(db)

    // If password is being updated, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10)
    }

    const updated = await userModel.update(params.userId, body)

    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = await userModel.findById(params.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...sanitizedUser } = user

    return NextResponse.json({ success: true, user: sanitizedUser })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const db = await getDb()
    const userModel = new UserModel(db)

    const deleted = await userModel.delete(params.userId)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
  }
}
