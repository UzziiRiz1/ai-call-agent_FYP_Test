import type { CallIntent } from "@/lib/types"
// [CRITICAL] This import must match the exported function name exactly
import { classifyIntentWithGPT } from "@/lib/openai-client"

const INTENT_KEYWORDS: Record<CallIntent, string[]> = {
  appointment: ["appointment", "schedule", "book", "visit", "meeting", "consultation"],
  prescription: ["prescription", "medication", "medicine", "refill", "pharmacy"],
  general_inquiry: ["question", "help", "information", "inquiry", "ask", "know"],
  emergency: ["emergency", "urgent", "ambulance", "911", "help me", "dying", "pain", "chest", "bleeding"],
  outbound_notification: ["notification", "alert", "reminder"],
  unknown: [],
}

export async function classifyIntent(transcript: string): Promise<CallIntent> {
  // Try GPT first for better accuracy
  try {
    const gptResult = await classifyIntentWithGPT(transcript)
    if (gptResult.intent !== "unknown") {
      return gptResult.intent
    }
  } catch (error) {
    console.warn("GPT classification failed, falling back to keywords")
  }

  // Fallback to basic keyword matching
  const lowerTranscript = transcript.toLowerCase()
  
  // Emergency check first (priority)
  if (INTENT_KEYWORDS.emergency.some(k => lowerTranscript.includes(k))) {
    return "emergency"
  }

  // Check other intents
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === "emergency") continue
    if (keywords.some(k => lowerTranscript.includes(k))) {
      return intent as CallIntent
    }
  }

  return "general_inquiry"
}