export type CallStatus = "pending" | "active" | "completed" | "failed" | "in-progress" | "ringing" | "initiated"
export type CallIntent =
  | "appointment"
  | "prescription"
  | "general_inquiry"
  | "emergency"
  | "outbound_notification"
  | "unknown"
export type Priority = "low" | "medium" | "high" | "critical"

export interface Call {
  _id?: string
  callId: string
  patientName: string
  phoneNumber: string
  status: CallStatus
  intent: CallIntent
  priority: Priority
  duration: number
  transcript: string
  emergencyDetected: boolean
  aiResponse: string
  timestamp: Date
  completedAt?: Date
  callSid?: string
  direction?: "inbound" | "outbound"
  recordingUrl?: string
  recordingSid?: string
  recordingDuration?: number
  fullTranscript?: string
  transcriptConfidence?: number
  transcriptionStatus?: string
  emergencySeverity?: string
  emergencyKeywords?: string[]
  initiatedBy?: string
}

export interface User {
  _id?: string
  email: string
  password: string
  role: "admin" | "operator"
  name: string
  createdAt: Date
}

export interface DashboardStats {
  totalCalls: number
  activeCalls: number
  completedCalls: number
  emergencyCalls: number
  averageDuration: number
  intentDistribution: Record<CallIntent, number>
}
