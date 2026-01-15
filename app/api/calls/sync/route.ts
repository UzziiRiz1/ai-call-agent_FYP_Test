import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { getTwilioClient } from "@/lib/twilio-client"

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { callId } = await request.json().catch(() => ({}))

        const db = await getDb()
        const callsCollection = db.collection("calls")
        const client = getTwilioClient()

        // Query for identifying calls that might need syncing
        // If callId is provided, sync just that one.
        // Otherwise, sync all "active" or "in-progress" calls.
        const query = callId
            ? { callId: callId }
            : { status: { $in: ["queued", "ringing", "in-progress"] } }

        const callsToSync = await callsCollection.find(query).toArray()
        const results = []

        for (const call of callsToSync) {
            if (!call.callSid) continue

            try {
                const twilioCall = await client.calls(call.callSid).fetch()

                // Only update if status has changed
                if (twilioCall.status !== call.status) {
                    const updateData: any = {
                        status: twilioCall.status,
                        updatedAt: new Date()
                    }

                    if (twilioCall.status === 'completed' || twilioCall.status === 'canceled' || twilioCall.status === 'failed' || twilioCall.status === 'busy' || twilioCall.status === 'no-answer') {
                        if (twilioCall.endTime) updateData.endTime = twilioCall.endTime
                        if (twilioCall.duration) updateData.duration = parseInt(twilioCall.duration)
                    }

                    await callsCollection.updateOne(
                        { _id: call._id },
                        { $set: updateData }
                    )
                    results.push({ callId: call.callId, oldStatus: call.status, newStatus: twilioCall.status })
                }
            } catch (err: any) {
                console.error(`Failed to sync call ${call.callId}:`, err.message)
                // If 404, maybe mark as failed or unknown in DB? specific to needs.
                // For now, ignoring.
            }
        }

        return NextResponse.json({ success: true, updated: results.length, details: results })
    } catch (error) {
        console.error("[v0] Error syncing calls:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
