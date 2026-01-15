import type { Priority } from "@/lib/types"
import { detectEmergencyWithGPT } from "@/lib/openai-client"

const EMERGENCY_KEYWORDS = [
   // ENglish
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

  // Urdu (Roman / Transliterated)
  "madad", "bachao", "dard", "khoon", "behosh", "saans",
  "dil ka dora", "hapat", "emergency", "ambulance",
  "chot lagi", "mar raha"
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

export async function detectEmergencyWithAI(
  transcript: string,
): Promise<{ isEmergency: boolean; severity: string; keywords: string[] }> {
  try {
    const result = await detectEmergencyWithGPT(transcript)
    console.log("[v0] AI Emergency Detection:", result)
    return {
      isEmergency: result.isEmergency,
      severity: result.severity,
      keywords: result.keywords,
    }
  } catch (error) {
    console.error("[v0] Falling back to keyword-based emergency detection:", error)
    const isEmergency = detectEmergency(transcript)
    return {
      isEmergency,
      severity: isEmergency ? "high" : "none",
      keywords: isEmergency ? EMERGENCY_KEYWORDS.filter((k) => transcript.toLowerCase().includes(k)) : [],
    }
  }
}
