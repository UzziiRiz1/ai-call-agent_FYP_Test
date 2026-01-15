import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

// Default configuration
const defaultConfig = {
    clinicName: "AI Medical Center",
    timezone: "UTC",
    officeHours: {
        start: "09:00",
        end: "17:00"
    },
    aiVoice: "alloy",
    systemPrompt: "You are a helpful medical receptionist...",
    enableEmergencyDetection: true,
    emergencyContact: "+1234567890",
    notificationsEmail: "admin@clinic.com"
}

export async function GET(request: Request) {
    try {
        const db = await getDb()
        const collection = db.collection("settings")

        const settings = await collection.findOne({ type: "general" })

        return NextResponse.json({
            success: true,
            config: settings ? settings.config : defaultConfig
        })
    } catch (error) {
        console.error("[v0] Error fetching settings:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const db = await getDb()
        const collection = db.collection("settings")

        await collection.updateOne(
            { type: "general" },
            {
                $set: {
                    type: "general",
                    config: body,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        )

        return NextResponse.json({ success: true, config: body })
    } catch (error) {
        console.error("[v0] Error updating settings:", error)
        return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
    }
}
