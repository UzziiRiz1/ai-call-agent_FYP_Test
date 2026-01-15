import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { DoctorModel } from "@/models/Doctor"

export async function GET(request: Request, props: { params: Promise<{ doctorId: string }> }) {
  const params = await props.params;
  try {
    const db = await getDb()
    const doctorModel = new DoctorModel(db)

    const doctor = await doctorModel.findById(params.doctorId)

    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, doctor })
  } catch (error) {
    console.error("[v0] Error fetching doctor:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch doctor" }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ doctorId: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json()
    const db = await getDb()
    const doctorModel = new DoctorModel(db)

    const updated = await doctorModel.update(params.doctorId, body)

    if (!updated) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 })
    }

    const doctor = await doctorModel.findById(params.doctorId)
    return NextResponse.json({ success: true, doctor })
  } catch (error) {
    console.error("[v0] Error updating doctor:", error)
    return NextResponse.json({ success: false, error: "Failed to update doctor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ doctorId: string }> }) {
  const params = await props.params;
  try {
    const db = await getDb()
    const doctorModel = new DoctorModel(db)

    const deleted = await doctorModel.delete(params.doctorId)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Doctor deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting doctor:", error)
    return NextResponse.json({ success: false, error: "Failed to delete doctor" }, { status: 500 })
  }
}
