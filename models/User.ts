import { type Db, type Collection, ObjectId } from "mongodb"

export interface IUser {
  _id?: ObjectId
  email: string
  password: string
  role: "admin" | "operator" | "doctor"
  name: string
  phone?: string
  specialization?: string
  availability?: boolean
  createdAt: Date
  updatedAt: Date
}

export class UserModel {
  private collection: Collection<IUser>

  constructor(db: Db) {
    this.collection = db.collection<IUser>("users")
    this.createIndexes()
  }

  private async createIndexes() {
    await this.collection.createIndex({ email: 1 }, { unique: true })
    await this.collection.createIndex({ role: 1 })
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.collection.findOne({ email })
  }

  async findById(id: string | ObjectId): Promise<IUser | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    return this.collection.findOne({ _id })
  }

  async create(user: Omit<IUser, "_id" | "createdAt" | "updatedAt">): Promise<IUser> {
    const newUser = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await this.collection.insertOne(newUser as IUser)
    return { ...newUser, _id: result.insertedId }
  }

  async findAll(): Promise<IUser[]> {
    return this.collection.find().toArray()
  }

  async update(id: string | ObjectId, updates: Partial<IUser>): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.updateOne({ _id }, { $set: { ...updates, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id
    const result = await this.collection.deleteOne({ _id })
    return result.deletedCount > 0
  }
}
