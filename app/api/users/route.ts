import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const db = await getDb()
    const userModel = new UserModel(db)

    const users = await userModel.findAll()

    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json({ success: true, users: sanitizedUsers })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role, name, phone } = body

    if (!email || !password || !role || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const userModel = new UserModel(db)

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await userModel.create({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
    })

    // Remove password from response
    const { password: _, ...sanitizedUser } = user

    return NextResponse.json({ success: true, user: sanitizedUser }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}
