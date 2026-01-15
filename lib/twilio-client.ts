import twilio from "twilio"

let twilioClient: ReturnType<typeof twilio> | null = null

// SECURE IMPLEMENTATION: No hardcoded credentials
// Credentials must be provided via environment variables in .env.local
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client
export function getTwilioClient() {
  if (twilioClient) return twilioClient

  const accountSid = TWILIO_ACCOUNT_SID
  const authToken = TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your .env.local file.",
    )
  }

  // Only log the first few characters for debugging safety
  console.log("[v0] Initializing Twilio client with Account SID:", accountSid.substring(0, 4) + "...")
  
  twilioClient = twilio(accountSid, authToken)
  return twilioClient
}

// Get Twilio phone number
export function getTwilioPhoneNumber() {
  const phoneNumber = TWILIO_PHONE_NUMBER
  if (!phoneNumber) {
    throw new Error("Twilio phone number not configured. Please add TWILIO_PHONE_NUMBER to your .env.local file.")
  }
  return phoneNumber
}

// Verify Twilio webhook signature for security
export function verifyTwilioSignature(signature: string, url: string, params: any): boolean {
  const authToken = TWILIO_AUTH_TOKEN
  if (!authToken) return false

  return twilio.validateRequest(authToken, signature, url, params)
}