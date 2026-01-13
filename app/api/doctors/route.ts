import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { DoctorModel } from "@/models/Doctor"
import { UserModel } from "@/models/User"
import type { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get("specialization") || undefined
    const isActive = searchParams.get("isActive") === "true" ? true : undefined

    const db = await getDb()
    const doctorModel = new DoctorModel(db)

    const filter: any = {}
    if (specialization) filter.specialization = specialization
    if (isActive !== undefined) filter.isActive = isActive

    const doctors = await doctorModel.findAll(filter)

    return NextResponse.json({ success: true, doctors })
  } catch (error) {
    console.error("[v0] Error fetching doctors:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch doctors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, specialization, licenseNumber, password, availability } = body

    if (!name || !email || !phone || !specialization || !licenseNumber || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const userModel = new UserModel(db)
    const doctorModel = new DoctorModel(db)

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 })
    }

    // Create user account for doctor
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userModel.create({
      email,
      password: hashedPassword,
      role: "doctor",
      name,
      phone,
      specialization,
      availability: true,
    })

    // Create doctor profile
    const doctor = await doctorModel.create({
      userId: user._id as ObjectId,
      name,
      email,
      phone,
      specialization,
      licenseNumber,
      availability: availability || {},
      isActive: true,
    })

    return NextResponse.json({ success: true, doctor }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating doctor:", error)
    return NextResponse.json({ success: false, error: "Failed to create doctor" }, { status: 500 })
  }
}
