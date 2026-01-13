import type { Db, Collection, ObjectId } from "mongodb"

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"

export interface IAppointment {
  _id?: ObjectId
  patientName: string
  patientPhone: string
  patientEmail?: string
  doctorId: ObjectId
  doctorName: string
  callId?: string
  appointmentDate: Date
  appointmentTime: string
  duration: number
  reason: string
  notes?: string
  status: AppointmentStatus
  reminderSent: boolean
  createdAt: Date
  updatedAt: Date
}

export class AppointmentModel {
  private collection: Collection<IAppointment>

  constructor(db: Db) {
    this.collection = db.collection<IAppointment>("appointments")
    this.createIndexes()
  }

  private async createIndexes() {
    await this.collection.createIndex({ doctorId: 1 })
    await this.collection.createIndex({ appointmentDate: 1 })
    await this.collection.createIndex({ status: 1 })
    await this.collection.createIndex({ patientPhone: 1 })
    await this.collection.createIndex({ callId: 1 })
  }

  async create(
    appointment: Omit<IAppointment, "_id" | "createdAt" | "updatedAt" | "reminderSent">,
  ): Promise<IAppointment> {
    const newAppointment = {
      ...appointment,
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await this.collection.insertOne(newAppointment as IAppointment)
    return { ...newAppointment, _id: result.insertedId }
  }

  async findById(id: string | ObjectId): Promise<IAppointment | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    return this.collection.findOne({ _id })
  }

  async findByCallId(callId: string): Promise<IAppointment | null> {
    return this.collection.findOne({ callId })
  }

  async findAll(
    filter: {
      doctorId?: string | ObjectId
      status?: AppointmentStatus
      date?: Date
    } = {},
  ): Promise<IAppointment[]> {
    const query: any = {}
    if (filter.doctorId) {
      query.doctorId = typeof filter.doctorId === "string" ? new ObjectId(filter.doctorId) : filter.doctorId
    }
    if (filter.status) {
      query.status = filter.status
    }
    if (filter.date) {
      const startOfDay = new Date(filter.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filter.date)
      endOfDay.setHours(23, 59, 59, 999)
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay }
    }
    return this.collection.find(query).sort({ appointmentDate: 1, appointmentTime: 1 }).toArray()
  }

  async update(id: string | ObjectId, updates: Partial<IAppointment>): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.updateOne({ _id }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.deleteOne({ _id })
    return result.deletedCount > 0
  }

  async markReminderSent(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.updateOne({ _id }, { $set: { reminderSent: true, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }
}
