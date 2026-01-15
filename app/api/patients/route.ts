import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { PatientModel } from "@/models/Patient"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const name = searchParams.get("name") || undefined

        const db = await getDb()
        const patientModel = new PatientModel(db)

        const patients = await patientModel.findAll({ name })

        return NextResponse.json({ success: true, patients })
    } catch (error) {
        console.error("[v0] Error fetching patients:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch patients" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, phone, email, dob, address, medicalHistory, allergies, notes } = body

        if (!name || !phone) {
            return NextResponse.json({ success: false, error: "Name and phone are required" }, { status: 400 })
        }

        const db = await getDb()
        const patientModel = new PatientModel(db)

        // Check availability
        const existing = await patientModel.findByPhone(phone)
        if (existing) {
            return NextResponse.json({ success: false, error: "Patient with this phone already exists" }, { status: 400 })
        }

        const patient = await patientModel.create({
            name,
            phone,
            email,
            dob: dob ? new Date(dob) : undefined,
            address,
            medicalHistory: medicalHistory || [],
            allergies: allergies || [],
            notes,
        })

        return NextResponse.json({ success: true, patient }, { status: 201 })
    } catch (error) {
        console.error("[v0] Error creating patient:", error)
        return NextResponse.json({ success: false, error: "Failed to create patient" }, { status: 500 })
    }
}
