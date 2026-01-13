import type { Priority } from "@/lib/types"

const EMERGENCY_KEYWORDS = [
  "emergency",
  "urgent",
  "help me",
  "dying",
  "can't breathe",
  "chest pain",
  "heart attack",
  "stroke",
  "bleeding heavily",
  "severe pain",
  "unconscious",
  "seizure",
  "overdose",
  "suicide",
  "accident",
  "injury",
  "ambulance",
  "911",
  "critical",
]

const HIGH_PRIORITY_KEYWORDS = [
  "pain",
  "hurt",
  "sick",
  "fever",
  "vomiting",
  "infection",
  "broken",
  "swelling",
  "rash",
  "bleeding",
]

const MEDIUM_PRIORITY_KEYWORDS = ["uncomfortable", "concern", "worried", "anxious", "question about", "need to know"]

export function detectEmergency(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase()

  return EMERGENCY_KEYWORDS.some((keyword) => lowerTranscript.includes(keyword))
}

export function calculatePriority(transcript: string, emergencyDetected: boolean): Priority {
  if (emergencyDetected) {
    return "critical"
  }

  const lowerTranscript = transcript.toLowerCase()

  const highPriorityMatch = HIGH_PRIORITY_KEYWORDS.some((keyword) => lowerTranscript.includes(keyword))

  if (highPriorityMatch) {
    return "high"
  }

  const mediumPriorityMatch = MEDIUM_PRIORITY_KEYWORDS.some((keyword) => lowerTranscript.includes(keyword))

  if (mediumPriorityMatch) {
    return "medium"
  }

  return "low"
}

export function getEmergencyContext(transcript: string): string {
  const lowerTranscript = transcript.toLowerCase()
  const matchedKeywords = EMERGENCY_KEYWORDS.filter((keyword) => lowerTranscript.includes(keyword))

  if (matchedKeywords.length === 0) {
    return ""
  }

  return `Emergency detected: Keywords found - ${matchedKeywords.join(", ")}`
}
