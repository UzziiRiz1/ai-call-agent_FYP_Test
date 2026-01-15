import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { AppointmentModel } from "@/models/Appointment"

export async function GET(request: Request, props: { params: Promise<{ appointmentId: string }> }) {
  const params = await props.params;
  try {
    const db = await getDb()
    const appointmentModel = new AppointmentModel(db)

    const appointment = await appointmentModel.findById(params.appointmentId)

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error("[v0] Error fetching appointment:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch appointment" }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ appointmentId: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json()
    const db = await getDb()
    const appointmentModel = new AppointmentModel(db)

    const updated = await appointmentModel.update(params.appointmentId, body)

    if (!updated) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    const appointment = await appointmentModel.findById(params.appointmentId)
    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error("[v0] Error updating appointment:", error)
    return NextResponse.json({ success: false, error: "Failed to update appointment" }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ appointmentId: string }> }) {
  const params = await props.params;
  try {
    const db = await getDb()
    const appointmentModel = new AppointmentModel(db)

    const deleted = await appointmentModel.delete(params.appointmentId)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting appointment:", error)
    return NextResponse.json({ success: false, error: "Failed to delete appointment" }, { status: 500 })
  }
}
