import { MongoClient, type Db } from "mongodb"

// SECURE: Retrieve URI only from environment variables
const MONGODB_URI = process.env.MONGODB_URI

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

export async function connectDB(): Promise<Db> {
  if (!MONGODB_URI) {
    throw new Error("Invalid/Missing environment variable: 'MONGODB_URI'. Add it to your .env.local file.")
  }

  const options = {}

  try {
    if (!clientPromise) {
      if (process.env.NODE_ENV === "development") {
        const globalWithMongo = global as typeof globalThis & {
          _mongoClientPromise?: Promise<MongoClient>
        }

        if (!globalWithMongo._mongoClientPromise) {
          client = new MongoClient(MONGODB_URI, options)
          globalWithMongo._mongoClientPromise = client.connect()
        }
        clientPromise = globalWithMongo._mongoClientPromise
      } else {
        client = new MongoClient(MONGODB_URI, options)
        clientPromise = client.connect()
      }
    }

    const connectedClient = await clientPromise
    // We assume the DB name is in the connection string, or default to 'ai-call-agent'
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