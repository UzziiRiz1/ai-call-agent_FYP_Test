import { MongoClient, type Db } from "mongodb"

const MONGODB_URI =
  "mongodb+srv://hamza:T1t9sapHM5PWIAst@fyp.ilnd6wu.mongodb.net/?retryWrites=true&w=majority&appName=FYP"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGODB_URI || MONGODB_URI

  console.log("[v0] MongoDB URI available:", !!uri)

  const options = {}

  try {
    if (!clientPromise) {
      if (process.env.NODE_ENV === "development") {
        const globalWithMongo = global as typeof globalThis & {
          _mongoClientPromise?: Promise<MongoClient>
        }

        if (!globalWithMongo._mongoClientPromise) {
          client = new MongoClient(uri, options)
          globalWithMongo._mongoClientPromise = client.connect()
        }
        clientPromise = globalWithMongo._mongoClientPromise
      } else {
        client = new MongoClient(uri, options)
        clientPromise = client.connect()
      }
    }

    const connectedClient = await clientPromise
    console.log("[v0] MongoDB connected successfully")
    return connectedClient.db("ai-call-agent")
  } catch (error) {
    clientPromise = null
    console.error("[v0] MongoDB connection error:", error)
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getDb(): Promise<Db> {
  return connectDB()
}
