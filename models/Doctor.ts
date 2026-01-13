import type { Db, Collection, ObjectId } from "mongodb"

export interface IDoctor {
  _id?: ObjectId
  userId: ObjectId
  name: string
  email: string
  phone: string
  specialization: string
  licenseNumber: string
  availability: {
    monday?: { start: string; end: string }
    tuesday?: { start: string; end: string }
    wednesday?: { start: string; end: string }
    thursday?: { start: string; end: string }
    friday?: { start: string; end: string }
    saturday?: { start: string; end: string }
    sunday?: { start: string; end: string }
  }
  isActive: boolean
  rating?: number
  totalAppointments: number
  createdAt: Date
  updatedAt: Date
}

export class DoctorModel {
  private collection: Collection<IDoctor>

  constructor(db: Db) {
    this.collection = db.collection<IDoctor>("doctors")
    this.createIndexes()
  }

  private async createIndexes() {
    await this.collection.createIndex({ email: 1 }, { unique: true })
    await this.collection.createIndex({ specialization: 1 })
    await this.collection.createIndex({ isActive: 1 })
  }

  async create(doctor: Omit<IDoctor, "_id" | "createdAt" | "updatedAt" | "totalAppointments">): Promise<IDoctor> {
    const newDoctor = {
      ...doctor,
      totalAppointments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await this.collection.insertOne(newDoctor as IDoctor)
    return { ...newDoctor, _id: result.insertedId }
  }

  async findById(id: string | ObjectId): Promise<IDoctor | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    return this.collection.findOne({ _id })
  }

  async findAll(filter: { specialization?: string; isActive?: boolean } = {}): Promise<IDoctor[]> {
    return this.collection.find(filter).toArray()
  }

  async update(id: string | ObjectId, updates: Partial<IDoctor>): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.updateOne({ _id }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.deleteOne({ _id })
    return result.deletedCount > 0
  }

  async incrementAppointments(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.updateOne(
      { _id },
      { $inc: { totalAppointments: 1 }, $set: { updatedAt: new Date() } },
    )
    return result.modifiedCount > 0
  }
}
