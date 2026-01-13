import twilio from "twilio"

let twilioClient: ReturnType<typeof twilio> | null = null

// Hardcoded Twilio credentials with fallback to env vars
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "AC796bbd69cfe238461bdb63c57f7264d6"
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "e704ec26e50705358bd9191f1d3062db"
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "+15394445797"

// Initialize Twilio client
export function getTwilioClient() {
  if (twilioClient) return twilioClient

  const accountSid = TWILIO_ACCOUNT_SID
  const authToken = TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your environment variables.",
    )
  }

  console.log("[v0] Initializing Twilio client with Account SID:", accountSid.substring(0, 10) + "...")
  twilioClient = twilio(accountSid, authToken)
  return twilioClient
}

// Get Twilio phone number
export function getTwilioPhoneNumber() {
  const phoneNumber = TWILIO_PHONE_NUMBER
  if (!phoneNumber) {
    throw new Error("Twilio phone number not configured. Please add TWILIO_PHONE_NUMBER to your environment variables.")
  }
  return phoneNumber
}

// Verify Twilio webhook signature for security
export function verifyTwilioSignature(signature: string, url: string, params: any): boolean {
  const authToken = TWILIO_AUTH_TOKEN
  if (!authToken) return false

  return twilio.validateRequest(authToken, signature, url, params)
}
