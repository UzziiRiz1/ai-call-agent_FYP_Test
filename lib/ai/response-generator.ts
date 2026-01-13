import type { CallIntent } from "@/lib/types"
import { generateAIResponse as generateOpenAIResponse } from "@/lib/openai-client"

export async function generateAIResponseWithOpenAI(
  transcript: string,
  intent: CallIntent,
  emergencyDetected: boolean,
): Promise<string> {
  try {
    const response = await generateOpenAIResponse(transcript, intent, emergencyDetected)
    console.log("[v0] AI Generated Response:", response)
    return response
  } catch (error) {
    console.error("[v0] Falling back to template-based responses:", error)
    return generateAIResponse(intent, "Patient", emergencyDetected)
  }
}

export function generateAIResponse(intent: CallIntent, patientName: string, emergencyDetected: boolean): string {
  if (emergencyDetected) {
    return `EMERGENCY ALERT for ${patientName}. This call has been flagged as critical and requires immediate attention. Emergency services should be contacted if not already done. Medical staff should respond within 2 minutes.`
  }

  switch (intent) {
    case "appointment":
      return `Hello ${patientName}, thank you for calling about scheduling an appointment. I can help you with that. Our office hours are Monday through Friday, 9 AM to 5 PM. What type of appointment are you looking to schedule, and do you have a preferred date and time?`

    case "prescription":
      return `Hello ${patientName}, I understand you're calling about a prescription. I'll need some information to assist you. Could you please provide the medication name and the prescribing doctor? I'll check our system and help coordinate with the pharmacy for your refill.`

    case "general_inquiry":
      return `Hello ${patientName}, thank you for calling. I'm here to help answer your questions. Could you please tell me more about what information you're looking for? Whether it's about our services, insurance, billing, or general medical questions, I'll do my best to assist you.`

    case "emergency":
      return `${patientName}, I understand this is an emergency situation. Please stay on the line. I'm connecting you with our emergency response team immediately. If you're experiencing a life-threatening emergency, please call 911 or go to the nearest emergency room. Do not hang up.`

    default:
      return `Hello ${patientName}, thank you for calling our medical office. How can I assist you today?`
  }
}

export function generateFollowUpInstructions(intent: CallIntent, emergencyDetected: boolean): string {
  if (emergencyDetected) {
    return "IMMEDIATE ACTION REQUIRED: Contact emergency services, notify on-call physician, prepare emergency response team."
  }

  switch (intent) {
    case "appointment":
      return "Schedule appointment in system, send confirmation email, add to calendar with reminder."

    case "prescription":
      return "Verify prescription details, check patient history, contact pharmacy for refill authorization."

    case "general_inquiry":
      return "Provide requested information, offer additional assistance, document inquiry in patient record."

    case "emergency":
      return "Transfer to emergency line immediately, document all details, follow emergency protocol."

    default:
      return "Document call details, follow up within 24 hours, update patient record."
  }
}

export const generateResponse = generateAIResponseWithOpenAI
