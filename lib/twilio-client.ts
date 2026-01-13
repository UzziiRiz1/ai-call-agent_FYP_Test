import twilio from "twilio"

let twilioClient: ReturnType<typeof twilio> | null = null

// Initialize Twilio client
export function getTwilioClient() {
  if (twilioClient) return twilioClient

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your environment variables.",
    )
  }

  twilioClient = twilio(accountSid, authToken)
  return twilioClient
}

// Get Twilio phone number
export function getTwilioPhoneNumber() {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER
  if (!phoneNumber) {
    throw new Error("Twilio phone number not configured. Please add TWILIO_PHONE_NUMBER to your environment variables.")
  }
  return phoneNumber
}

// Verify Twilio webhook signature for security
export function verifyTwilioSignature(signature: string, url: string, params: any): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  return twilio.validateRequest(authToken, signature, url, params)
}
