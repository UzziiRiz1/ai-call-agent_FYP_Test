import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifyPassword, createToken, setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login attempt started")
    const { email, password } = await request.json()

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!process.env.MONGODB_URI) {
      console.error("[v0] MongoDB URI not configured")
      return NextResponse.json(
        { error: "Database not configured. Please set MONGODB_URI environment variable." },
        { status: 500 },
      )
    }

    console.log("[v0] Connecting to database...")
    const db = await getDb()
    console.log("[v0] Database connected, finding user...")

    const user = await db.collection("users").findOne({ email })
    console.log("[v0] User found:", !!user)

    if (!user) {
      console.log("[v0] User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Verifying password...")
    const isValid = await verifyPassword(password, user.password)
    console.log("[v0] Password valid:", isValid)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Creating token...")
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    console.log("[v0] Setting session...")
    await setSession(token)

    console.log("[v0] Login successful")
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: `Login failed: ${errorMessage}` }, { status: 500 })
  }
}
