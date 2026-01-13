import { classifyIntentWithAI } from "./intent-classifier"
import { detectEmergencyWithAI, calculatePriority } from "./emergency-detector"
import { generateAIResponseWithOpenAI } from "./response-generator"
import type { CallIntent, Priority } from "@/lib/types"

export interface TranscriptAnalysis {
  intent: CallIntent
  priority: Priority
  emergencyDetected: boolean
  emergencySeverity?: string
  emergencyKeywords?: string[]
  aiResponse: string
  confidence?: number
}

export async function handleNewTranscript(transcript: string, patientName = "Patient"): Promise<TranscriptAnalysis> {
  console.log("[v0] Processing new transcript with AI...")

  // Parallel AI processing for faster response
  const [intentResult, emergencyResult] = await Promise.all([
    classifyIntentWithAI(transcript),
    detectEmergencyWithAI(transcript),
  ])

  const intent = intentResult
  const emergencyDetected = emergencyResult.isEmergency
  const priority = calculatePriority(transcript, emergencyDetected)

  // Generate AI response
  const aiResponse = await generateAIResponseWithOpenAI(transcript, intent, emergencyDetected)

  console.log("[v0] Transcript Analysis Complete:", {
    intent,
    priority,
    emergencyDetected,
    severity: emergencyResult.severity,
  })

  return {
    intent,
    priority,
    emergencyDetected,
    emergencySeverity: emergencyResult.severity,
    emergencyKeywords: emergencyResult.keywords,
    aiResponse,
  }
}
