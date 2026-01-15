import { ObjectId } from "mongodb"
import path from "path"
import fs from "fs"
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

// 1. Load Environment Variables MANUALLY before any other imports
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx > 0) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    let val = trimmed.substring(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    process.env[key] = val;
                }
            }
        });
        console.log("✅ Loaded .env.local");
    } catch (e) {
        console.error("Failed to parse .env.local", e);
    }
} else {
    console.warn("⚠️ .env.local not found at", envPath);
}

// Local helper to avoid importing from lib/auth
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

// Helper to generate random coordinates near Karachi
// Center: Karachi (24.8607° N, 67.0011° E)
function getRandomLocation(centerLat = 24.8607, centerLng = 67.0011, radiusKm = 10) {
    const y0 = centerLat;
    const x0 = centerLng;
    const rd = radiusKm * 1000 / 111300; // about 111300 meters in one degree

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const newLat = y + y0;
    const newLng = x + x0;

    return {
        type: "Point" as const,
        coordinates: [newLng, newLat] // MongoDB uses [lng, lat]
    };
}

// 2. Main Seed Function with Dynamic Imports
async function seed() {
    console.log("🌱 Starting database seeding (Karachi Edition)...")

    try {
        // Dynamic import ensures lib/mongodb reads the process.env we just set
        const { getDb } = await import("../lib/mongodb");
        const db = await getDb()
        console.log("Connected to MongoDB via getDb()")

        // Collections
        const doctors = db.collection("doctors")
        const patients = db.collection("patients")
        const appointments = db.collection("appointments")
        const users = db.collection("users")

        console.log("🧹 Clearing existing data...")
        await doctors.deleteMany({});
        await patients.deleteMany({});
        await appointments.deleteMany({});
        // We carefully delete users to avoid deleting the admin if established, 
        // but for a full "delete all seeded data" request, we'll clear doctor/patient users.
        await users.deleteMany({ role: { $in: ["doctor", "patient"] } });

        // Ensure geospatial index
        await doctors.createIndex({ location: "2dsphere" });
        console.log("📍 Created 2dsphere index on doctors.location");

        // --- Data Definitions ---

        // 1. Create Doctors & Linked Users
        console.log("Creating Doctors and Users...")
        const doctorProfiles = [
            { name: "Dr. Ahmed Khan", email: "ahmed.khan@clinic.pk", spec: "Cardiology", phone: "+923001234567", license: "PMDC-12345", address: "Aga Khan Hospital, Stadium Road, Karachi" },
            { name: "Dr. Fatima Ali", email: "fatima.ali@clinic.pk", spec: "Pediatrics", phone: "+923002345678", license: "PMDC-23456", address: "South City Hospital, Clifton, Karachi" },
            { name: "Dr. Bilal Ahmed", email: "bilal.ahmed@clinic.pk", spec: "Dermatology", phone: "+923003456789", license: "PMDC-34567", address: "Liaquat National Hospital, Karachi" },
            { name: "Dr. Zainab Raza", email: "zainab.raza@clinic.pk", spec: "Orthopedics", phone: "+923004567890", license: "PMDC-45678", address: "OMI Hospital, Saddar, Karachi" },
            { name: "Dr. Omar Farooq", email: "omar.farooq@clinic.pk", spec: "Neurology", phone: "+923005678901", license: "PMDC-56789", address: "Dow University Hospital, Ojha, Karachi" },
            { name: "Dr. Ayesha Siddiqui", email: "ayesha.siddiqui@clinic.pk", spec: "General Practice", phone: "+923006789012", license: "PMDC-67890", address: "Patel Hospital, Gulshan-e-Iqbal, Karachi" },
            { name: "Dr. Usman Gorman", email: "usman.gorman@clinic.pk", spec: "Psychiatry", phone: "+923007890123", license: "PMDC-78901", address: "Karachi Psychiatric Hospital, Nazimabad, Karachi" },
            { name: "Dr. Sana Mir", email: "sana.mir@clinic.pk", spec: "Ophthalmology", phone: "+923008901234", license: "PMDC-89012", address: "Hashmani's Hospital, Saddar, Karachi" },
            { name: "Dr. Hassan Raza", email: "hassan.raza@clinic.pk", spec: "General Practice", phone: "+923009012345", license: "PMDC-90123", address: "Indus Hospital, Korangi, Karachi" },
            { name: "Dr. Nida Karim", email: "nida.karim@clinic.pk", spec: "Cardiology", phone: "+923000123456", license: "PMDC-01234", address: "NICVD, Karachi" }
        ];

        const insertedDoctors = [];

        for (const doc of doctorProfiles) {
            // Create or get User ID
            const hashedPassword = await hashPassword("password123");

            // Insert User
            const userResult = await users.insertOne({
                email: doc.email,
                name: doc.name,
                role: "doctor",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const availability = {
                monday: { start: "09:00", end: "17:00" },
                tuesday: { start: "09:00", end: "17:00" },
                wednesday: { start: "09:00", end: "17:00" },
                thursday: { start: "09:00", end: "17:00" },
                friday: { start: "09:00", end: "13:00" },
            };

            const location = getRandomLocation(); // Random spot in Karachi

            const docResult = await doctors.insertOne({
                userId: userResult.insertedId,
                name: doc.name,
                email: doc.email,
                phone: doc.phone,
                specialization: doc.spec,
                licenseNumber: doc.license,
                address: doc.address,
                location: location,
                availability,
                isActive: true,
                totalAppointments: Math.floor(Math.random() * 100),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            insertedDoctors.push({ ...doc, _id: docResult.insertedId });
        }
        console.log(`✅ Seeded ${insertedDoctors.length} doctors`);


        // 2. Create Patients
        console.log("Creating Patients...")
        const patientProfiles = [
            { name: "Muhammad Ali", phone: "+923211111111", email: "ali.m@example.com", dob: "1985-06-15", history: ["Hypertension"], allergy: ["Penicillin"] },
            { name: "Sara Khan", phone: "+923212222222", email: "sara.k@example.com", dob: "1992-03-22", history: ["Migraines"], allergy: [] },
            { name: "Bilal Sheikh", phone: "+923213333333", email: "bilal.s@example.com", dob: "1978-11-05", history: [], allergy: ["Peanuts"] },
            { name: "Zoya Ahmed", phone: "+923214444444", email: "zoya.a@example.com", dob: "1990-01-15", history: ["Asthma"], allergy: ["Dust"] },
            { name: "Hamza Malik", phone: "+923215555555", email: "hamza.m@example.com", dob: "1982-08-30", history: ["Diabetes Type 2"], allergy: [] },
            { name: "Mariam Yusaf", phone: "+923216666666", email: "mariam.y@example.com", dob: "1970-05-12", history: ["Arthritis", "High Cholesterol"], allergy: ["Latex"] },
            { name: "Osman Tariq", phone: "+923217777777", email: "osman.t@example.com", dob: "1965-09-20", history: ["Cardiac Arrhythmia"], allergy: [] },
            { name: "Hira Shah", phone: "+923218888888", email: "hira.s@example.com", dob: "1995-12-05", history: [], allergy: ["Sulfa drugs"] },
            { name: "Fahad Mustafa", phone: "+923219999999", email: "fahad.m@example.com", dob: "1988-04-18", history: ["Eczema"], allergy: [] },
            { name: "Sadia Imam", phone: "+923210000000", email: "sadia.i@example.com", dob: "1980-02-28", history: ["Anxiety"], allergy: ["Aspirin"] },
            { name: "Kamran Akmal", phone: "+923221111111", email: "kamran.a@example.com", dob: "2000-07-07", history: [], allergy: [] },
            { name: "Mahira Khan", phone: "+923222222222", email: "mahira.k@example.com", dob: "1993-10-10", history: ["Hypothyroidism"], allergy: [] }
        ];

        const insertedPatients = [];
        for (const p of patientProfiles) {
            const result = await patients.insertOne({
                name: p.name,
                email: p.email,
                phone: p.phone,
                dob: new Date(p.dob),
                address: `${Math.floor(Math.random() * 99) + 1} Block ${Math.floor(Math.random() * 10)}, Gulshan-e-Iqbal, Karachi`,
                medicalHistory: p.history,
                allergies: p.allergy,
                notes: "Regular patient.",
                lastVisit: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 100))),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            insertedPatients.push({ ...p, _id: result.insertedId });
        }
        console.log(`✅ Seeded ${insertedPatients.length} patients`);

        // 3. Create Appointments
        console.log("Creating Appointments...")
        const APPOINTMENT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no-show"];
        const appointmentData = [];

        // Generate past appointments
        for (let i = 0; i < 20; i++) {
            const doc = insertedDoctors[Math.floor(Math.random() * insertedDoctors.length)];
            const pat = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
            const daysAgo = Math.floor(Math.random() * 60) + 1;
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            appointmentData.push({
                patientName: pat.name,
                patientPhone: pat.phone,
                patientEmail: pat.email,
                doctorId: doc._id,
                doctorName: doc.name,
                appointmentDate: date,
                appointmentTime: `${Math.floor(Math.random() * 9) + 9}:00`,
                duration: 30,
                reason: "Regular checkup",
                status: "completed",
                reminderSent: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Generate future appointments
        for (let i = 0; i < 15; i++) {
            const doc = insertedDoctors[Math.floor(Math.random() * insertedDoctors.length)];
            const pat = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
            const daysAhead = Math.floor(Math.random() * 30) + 1;
            const date = new Date();
            date.setDate(date.getDate() + daysAhead);

            const status = APPOINTMENT_STATUSES[Math.floor(Math.random() * 2)];

            appointmentData.push({
                patientName: pat.name,
                patientPhone: pat.phone,
                patientEmail: pat.email,
                doctorId: doc._id,
                doctorName: doc.name,
                appointmentDate: date,
                appointmentTime: `${Math.floor(Math.random() * 9) + 9}:30`,
                duration: 30,
                reason: ["Consultation", "Follow-up", "Screening", "Vaccination"][Math.floor(Math.random() * 4)],
                status: status,
                reminderSent: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Add some edge cases
        for (let i = 0; i < 5; i++) {
            const doc = insertedDoctors[Math.floor(Math.random() * insertedDoctors.length)];
            const pat = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 10));

            appointmentData.push({
                patientName: pat.name,
                patientPhone: pat.phone,
                patientEmail: pat.email,
                doctorId: doc._id,
                doctorName: doc.name,
                appointmentDate: date,
                appointmentTime: "11:00",
                duration: 30,
                reason: "Emergency",
                status: Math.random() > 0.5 ? "cancelled" : "no-show",
                reminderSent: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        if (appointmentData.length > 0) {
            await appointments.insertMany(appointmentData as any);
        }

        console.log(`✅ Seeded ${appointmentData.length} appointments`);
        console.log("🌱 Database seeding completed successfully!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        setTimeout(() => process.exit(0), 100);
    }
}

seed();
