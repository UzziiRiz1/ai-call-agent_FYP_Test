import { type Db, type Collection, ObjectId } from "mongodb"

export interface IPatient {
    _id?: ObjectId
    name: string
    email?: string
    phone: string
    dob?: Date
    address?: string
    medicalHistory?: string[]
    allergies?: string[]
    notes?: string
    lastVisit?: Date
    createdAt: Date
    updatedAt: Date
}

export class PatientModel {
    private collection: Collection<IPatient>

    constructor(db: Db) {
        this.collection = db.collection<IPatient>("patients")
        this.createIndexes()
    }

    private async createIndexes() {
        await this.collection.createIndex({ phone: 1 }, { unique: true })
        await this.collection.createIndex({ name: 1 })
        await this.collection.createIndex({ email: 1 })
    }

    async create(patient: Omit<IPatient, "_id" | "createdAt" | "updatedAt">): Promise<IPatient> {
        const newPatient = {
            ...patient,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const result = await this.collection.insertOne(newPatient as IPatient)
        return { ...newPatient, _id: result.insertedId }
    }

    async findById(id: string | ObjectId): Promise<IPatient | null> {
        const _id = typeof id === "string" ? new ObjectId(id) : id
        return this.collection.findOne({ _id })
    }

    async findByPhone(phone: string): Promise<IPatient | null> {
        return this.collection.findOne({ phone })
    }

    async findAll(filter: { name?: string } = {}): Promise<IPatient[]> {
        const query: any = {}
        if (filter.name) {
            query.name = { $regex: filter.name, $options: "i" }
        }
        return this.collection.find(query).sort({ name: 1 }).toArray()
    }

    async update(id: string | ObjectId, updates: Partial<IPatient>): Promise<boolean> {
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
