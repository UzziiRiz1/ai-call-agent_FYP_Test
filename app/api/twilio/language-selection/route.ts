import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { connectDB } from "@/lib/mongodb"

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const params = Object.fromEntries(formData)
        const { CallSid, Digits } = params

        const twiml = new VoiceResponse()
        const db = await connectDB()

        let language = "en-US" // Default
        let voice = "Polly.Joanna-Neural"
        let greeting = "Hello, how can I help you today?"

        if (Digits === "1") {
            // English
            language = "en-US"
            voice = "Polly.Joanna-Neural"
            greeting = "Hello, thank you for calling. How can I help you today?"
        } else if (Digits === "2") {
            // Urdu
            language = "ur-PK"
            // Twilio doesn't have a specific Urdu neural voice usually, but standard voices
            // or we let it auto-select. We'll use 'alice' or generic for Urdu if specific not found,
            // but actually 'ur-PK' language setting is key. The default voice for ur-PK usually works.
            // We will clear the 'voice' param for Urdu to let Twilio pick the best default.
            voice = ""
            greeting = "Medical assistance line par call karne ka shukriya. Main aapki kya madad kar sakti hoon?"
        } else {
            // Invalid input, ask again
            twiml.say("Invalid selection. Please try again.")
            twiml.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`)
            return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } })
        }

        // Update Call Record
        await db.collection("calls").updateOne(
            { callSid: CallSid as string },
            { $set: { language: language } }
        )

        // Start Conversation (Redirect to process-speech with initial greeting logic? 
        // Actually, process-speech expects SPEECH input usually.
        // We can use <Gather> here to get the first sentence, OR redirect to process-speech 
        // but process-speech logic might need adjustment to handle 'just connected' state
        // OR we just do the first Gather here and point action to process-speech.
        // Let's do the first Gather here to keep it simple.)

        // Setup the conversation Gather
        const gather = twiml.gather({
            input: ["speech"],
            action: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/process-speech`,
            method: "POST",
            speechTimeout: "auto",
            speechModel: "phone_call",
            enhanced: true,
            language: language as any, // Cast for TS
        })

        if (voice) {
            gather.say({ voice: voice as any }, greeting)
        } else {
            // For Urdu, rely on language setting
            gather.say({ language: language as any }, greeting)
        }

        // Fallback if no input
        twiml.say("We did not hear anything. Goodbye.")
        twiml.hangup()

        return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } })

    } catch (error) {
        console.error("Error in language selection:", error)
        const twiml = new VoiceResponse()
        twiml.say("An error occurred. Goodbye.")
        twiml.hangup()
        return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } })
    }
}
