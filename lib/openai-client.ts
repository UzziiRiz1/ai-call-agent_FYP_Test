import OpenAI from "openai"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

let openaiInstance: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Added to prevent client-side errors if used there
    })
  }
  return openaiInstance
}

// [CRITICAL] Ensure this is explicitly exported
export async function classifyIntentWithGPT(transcript: string): Promise<{
  intent: "appointment" | "prescription" | "general_inquiry" | "emergency" | "unknown"
  confidence: number
  reasoning: string
}> {
  const openai = getOpenAIClient()

  const prompt = `Analyze the following medical call transcript and classify the caller's intent.

Transcript: "${transcript}"

Classify into one of these categories:
- appointment: Caller wants to schedule, reschedule, or cancel an appointment
- prescription: Caller needs prescription refill, medication questions, or pharmacy
- general_inquiry: General questions about the clinic or services.
- emergency: Medical emergencies or urgent situations.
- find_doctor: Request to find a doctor, specialist, or hospital nearby.
- outbound_notification: An automated notification from the system.
- unknown: If the intent is not clear. or doesn't fit other categories

Respond in JSON format with: {"intent": "category", "confidence": 0-100, "reasoning": "brief explanation"}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert medical call analyzer. Classify patient intents accurately and concisely.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("No response from OpenAI")

    const result = JSON.parse(content)
    return result
  } catch (error) {
    console.error("[v0] OpenAI intent classification error:", error)
    return { intent: "unknown", confidence: 0, reasoning: "Error analyzing transcript" }
  }
}

export async function detectEmergencyWithGPT(transcript: string): Promise<{
  isEmergency: boolean
  severity: "none" | "low" | "medium" | "high" | "critical"
  keywords: string[]
  reasoning: string
}> {
  const openai = getOpenAIClient()

  const prompt = `Analyze this medical call transcript for emergency indicators:

Transcript: "${transcript}"

Detect emergency severity based on:
- Critical: Life-threatening (chest pain, stroke, severe bleeding, difficulty breathing)
- High: Urgent but not immediately life-threatening (high fever, severe pain, mental health crisis)
- Medium: Concerning symptoms requiring prompt attention
- Low: Minor concern, could wait
- None: No emergency indicators

Respond in JSON format with: {"isEmergency": boolean, "severity": "level", "keywords": ["key1", "key2"], "reasoning": "explanation"}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical triage expert. Assess emergency severity accurately to prioritize patient care.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 250,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("No response from OpenAI")

    const result = JSON.parse(content)
    return result
  } catch (error) {
    console.error("[v0] OpenAI emergency detection error:", error)
    return { isEmergency: false, severity: "none", keywords: [], reasoning: "Error analyzing transcript" }
  }
}

export async function generateAIResponse(transcript: string, intent: string, isEmergency: boolean): Promise<string> {
  const openai = getOpenAIClient()

  const prompt = `Generate a professional, empathetic response for a medical call AI agent.

Call Transcript: "${transcript}"
Detected Intent: ${intent}
Emergency: ${isEmergency ? "Yes" : "No"}

Guidelines:
- Be empathetic and professional
- Keep response under 100 words
- For emergencies: Acknowledge urgency, advise calling 911 if critical
- For appointments: Offer to schedule or check availability
- For prescriptions: Acknowledge request, mention pharmacy coordination
- For inquiries: Provide helpful guidance or offer to connect with medical staff

Generate the AI agent's response:`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a compassionate medical call center AI assistant. Provide helpful, professional responses.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    return response.choices[0]?.message?.content || "Thank you for calling. A representative will assist you shortly."
  } catch (error) {
    console.error("[v0] OpenAI response generation error:", error)
    return "Thank you for calling. A representative will assist you shortly."
  }
}