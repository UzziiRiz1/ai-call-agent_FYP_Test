import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { AppointmentModel } from "@/models/Appointment"
import { DoctorModel } from "@/models/Doctor"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId") || undefined
    const status = searchParams.get("status") || undefined
    const date = searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined

    const db = await getDb()
    const appointmentModel = new AppointmentModel(db)

    const filter: any = {}
    if (doctorId) filter.doctorId = doctorId
    if (status) filter.status = status
    if (date) filter.date = date

    const appointments = await appointmentModel.findAll(filter)

    return NextResponse.json({ success: true, appointments })
  } catch (error) {
    console.error("[v0] Error fetching appointments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorId,
      appointmentDate,
      appointmentTime,
      duration,
      reason,
      callId,
    } = body

    if (!patientName || !patientPhone || !doctorId || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const appointmentModel = new AppointmentModel(db)
    const doctorModel = new DoctorModel(db)

    // Verify doctor exists
    const doctor = await doctorModel.findById(doctorId)
    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 })
    }

    // Create appointment
    const appointment = await appointmentModel.create({
      patientName,
      patientPhone,
      patientEmail,
      doctorId: new ObjectId(doctorId),
      doctorName: doctor.name,
      callId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration: duration || 30,
      reason,
      status: "scheduled",
    })

    // Increment doctor's appointment count
    await doctorModel.incrementAppointments(doctorId)

    return NextResponse.json({ success: true, appointment }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating appointment:", error)
    return NextResponse.json({ success: false, error: "Failed to create appointment" }, { status: 500 })
  }
}
