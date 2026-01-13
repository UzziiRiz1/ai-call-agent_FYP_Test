import type { CallIntent } from "@/lib/types"

const INTENT_KEYWORDS: Record<CallIntent, string[]> = {
  appointment: [
    "appointment",
    "schedule",
    "book",
    "visit",
    "meeting",
    "consultation",
    "see doctor",
    "check-up",
    "follow-up",
    "reschedule",
    "cancel appointment",
  ],
  prescription: [
    "prescription",
    "medication",
    "medicine",
    "refill",
    "drug",
    "pills",
    "pharmacy",
    "dosage",
    "treatment",
    "antibiotics",
  ],
  general_inquiry: [
    "question",
    "information",
    "inquiry",
    "ask",
    "know",
    "tell me",
    "wondering",
    "curious",
    "hours",
    "location",
    "insurance",
    "billing",
  ],
  emergency: [
    "emergency",
    "urgent",
    "help",
    "pain",
    "bleeding",
    "accident",
    "chest pain",
    "can't breathe",
    "unconscious",
    "seizure",
    "overdose",
    "severe",
  ],
}

export function classifyIntent(transcript: string): CallIntent {
  const lowerTranscript = transcript.toLowerCase()

  // Emergency takes highest priority
  const emergencyScore = countKeywordMatches(lowerTranscript, INTENT_KEYWORDS.emergency)
  if (emergencyScore > 0) {
    return "emergency"
  }

  // Calculate scores for other intents
  const scores: Record<CallIntent, number> = {
    appointment: countKeywordMatches(lowerTranscript, INTENT_KEYWORDS.appointment),
    prescription: countKeywordMatches(lowerTranscript, INTENT_KEYWORDS.prescription),
    general_inquiry: countKeywordMatches(lowerTranscript, INTENT_KEYWORDS.general_inquiry),
    emergency: 0,
  }

  // Find intent with highest score
  const maxScore = Math.max(...Object.values(scores))

  if (maxScore === 0) {
    return "general_inquiry" // Default to general inquiry if no keywords matched
  }

  const intent = (Object.keys(scores) as CallIntent[]).find((key) => scores[key] === maxScore)

  return intent || "general_inquiry"
}

function countKeywordMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    return count + (text.includes(keyword) ? 1 : 0)
  }, 0)
}

export function getIntentConfidence(transcript: string, intent: CallIntent): number {
  const lowerTranscript = transcript.toLowerCase()
  const matches = countKeywordMatches(lowerTranscript, INTENT_KEYWORDS[intent])
  const totalWords = transcript.split(" ").length

  return Math.min((matches / Math.max(totalWords * 0.1, 1)) * 100, 100)
}
