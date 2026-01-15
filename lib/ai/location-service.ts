import { DoctorModel, type IDoctor } from "@/models/Doctor"
import { connectDB } from "@/lib/mongodb"

// Mock Geocoding for Demo (Karachi focused)
const MOCK_LOCATIONS: Record<string, [number, number]> = {
    "karachi": [67.0011, 24.8607],
    "clifton": [67.0281, 24.8138],
    "dha": [67.0694, 24.8026],
    "defence": [67.0694, 24.8026],
    "gulshan": [67.0971, 24.9142],
    "gulshan-e-iqbal": [67.0971, 24.9142],
    "pechs": [67.0543, 24.8660],
    "saddar": [67.0253, 24.8584],
    "nazimabad": [67.0309, 24.9144],
    "north nazimabad": [67.0396, 24.9372],
    "korangi": [67.1352, 24.8387],
    "malir": [67.1951, 24.9084],
    // Fallback
    "here": [67.0011, 24.8607],
}

export async function extractLocation(transcript: string): Promise<string | null> {
    const lower = transcript.toLowerCase()
    for (const city of Object.keys(MOCK_LOCATIONS)) {
        if (lower.includes(city)) {
            return city
        }
    }
    return null
}

export async function findNearbyDoctors(locationName: string): Promise<IDoctor[]> {
    const coords = MOCK_LOCATIONS[locationName.toLowerCase()]
    if (!coords) return []

    const db = await connectDB()
    const doctorModel = new DoctorModel(db)

    // Search within 5km
    return doctorModel.findNearby(coords[0], coords[1], 5000)
}
