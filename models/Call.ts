import { type Db, type Collection, ObjectId } from "mongodb"

export type CallStatus = "pending" | "active" | "completed" | "failed" | "in-progress" | "ringing" | "initiated"
export type CallIntent =
  | "appointment"
  | "prescription"
  | "general_inquiry"
  | "emergency"
  | "outbound_notification"
  | "unknown"
export type Priority = "low" | "medium" | "high" | "critical"

export interface ICall {
  _id?: ObjectId
  callId: string
  patientName: string
  phoneNumber: string
  location?: string // Added location field
  language?: string // Added language field for multi-language support
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

export class CallModel {
  private collection: Collection<ICall>

  constructor(db: Db) {
    this.collection = db.collection<ICall>("calls")
    this.createIndexes()
  }

  private async createIndexes() {
    await this.collection.createIndex({ callId: 1 }, { unique: true })
    await this.collection.createIndex({ callSid: 1 })
    await this.collection.createIndex({ phoneNumber: 1 })
    await this.collection.createIndex({ status: 1 })
    await this.collection.createIndex({ intent: 1 })
    await this.collection.createIndex({ priority: 1 })
    await this.collection.createIndex({ emergencyDetected: 1 })
    await this.collection.createIndex({ timestamp: -1 })
  }

  async create(call: Omit<ICall, "_id">): Promise<ICall> {
    const result = await this.collection.insertOne(call as ICall)
    return { ...call, _id: result.insertedId }
  }

  async findById(id: string | ObjectId): Promise<ICall | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    return this.collection.findOne({ _id })
  }

  async findByCallId(callId: string): Promise<ICall | null> {
    return this.collection.findOne({ callId })
  }

  async findByCallSid(callSid: string): Promise<ICall | null> {
    return this.collection.findOne({ callSid })
  }

  async findAll(
    filter: { status?: CallStatus; intent?: CallIntent; emergencyDetected?: boolean } = {},
  ): Promise<ICall[]> {
    return this.collection.find(filter).sort({ timestamp: -1 }).toArray()
  }

  async update(callId: string, updates: Partial<ICall>): Promise<boolean> {
    const result = await this.collection.updateOne({ callId }, { $set: updates })
    return result.modifiedCount > 0
  }

  async delete(callId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ callId })
    return result.deletedCount > 0
  }

  async getStats(): Promise<{
    totalCalls: number
    activeCalls: number
    completedCalls: number
    emergencyCalls: number
    averageDuration: number
    intentDistribution: Record<CallIntent, number>
  }> {
    const calls = await this.collection.find().toArray()

    const stats = {
      totalCalls: calls.length,
      activeCalls: calls.filter((c) => c.status === "active" || c.status === "in-progress").length,
      completedCalls: calls.filter((c) => c.status === "completed").length,
      emergencyCalls: calls.filter((c) => c.emergencyDetected).length,
      averageDuration: calls.length > 0 ? Math.round(calls.reduce((sum, c) => sum + c.duration, 0) / calls.length) : 0,
      intentDistribution: calls.reduce(
        (acc, call) => {
          acc[call.intent] = (acc[call.intent] || 0) + 1
          return acc
        },
        {} as Record<CallIntent, number>,
      ),
    }

    return stats
  }
}
