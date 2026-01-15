import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { PatientModel } from "@/models/Patient"

export async function GET(request: Request, props: { params: Promise<{ patientId: string }> }) {
    const params = await props.params;
    try {
        const db = await getDb()
        const patientModel = new PatientModel(db)

        const patient = await patientModel.findById(params.patientId)

        if (!patient) {
            return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, patient })
    } catch (error) {
        console.error("[v0] Error fetching patient:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch patient" }, { status: 500 })
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ patientId: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json()
        const db = await getDb()
        const patientModel = new PatientModel(db)

        const updated = await patientModel.update(params.patientId, body)

        if (!updated) {
            return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 })
        }

        const patient = await patientModel.findById(params.patientId)
        return NextResponse.json({ success: true, patient })
    } catch (error) {
        console.error("[v0] Error updating patient:", error)
        return NextResponse.json({ success: false, error: "Failed to update patient" }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ patientId: string }> }) {
    const params = await props.params;
    try {
        const db = await getDb()
        const patientModel = new PatientModel(db)

        const deleted = await patientModel.delete(params.patientId)

        if (!deleted) {
            return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Patient deleted successfully" })
    } catch (error) {
        console.error("[v0] Error deleting patient:", error)
        return NextResponse.json({ success: false, error: "Failed to delete patient" }, { status: 500 })
    }
}
