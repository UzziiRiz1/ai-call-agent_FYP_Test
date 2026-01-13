import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession, hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")

    const existingUser = await usersCollection.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = {
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json({
      user: {
        _id: result.insertedId.toString(),
        email,
        name,
        role,
        createdAt: newUser.createdAt,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
