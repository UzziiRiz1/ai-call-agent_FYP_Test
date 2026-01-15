export type CallStatus = "pending" | "active" | "completed" | "failed" | "in-progress" | "ringing" | "initiated"
export type CallIntent =
  | "appointment"
  | "prescription"
  | "general_inquiry"
  | "emergency"
  | "outbound_notification"
  | "unknown"
export type Priority = "low" | "medium" | "high" | "critical"

export type { IUser } from "../models/User"
export type { IDoctor } from "../models/Doctor"
export type { IAppointment, AppointmentStatus } from "../models/Appointment"
export type { ICall } from "../models/Call"
export type { IPatient } from "../models/Patient"

// Re-export ICall as Call for convenience
export type { ICall as Call } from "../models/Call"

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
