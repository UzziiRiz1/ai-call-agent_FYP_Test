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

// 2. Main Seed Function with Dynamic Imports
async function seed() {
    console.log("🌱 Starting database seeding...")

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

        // --- Data Definitions ---

        // 1. Create Doctors & Linked Users
        console.log("Creating Doctors and Users...")
        const doctorProfiles = [
            { name: "Dr. Sarah Smith", email: "sarah.smith@clinic.com", spec: "Cardiology", phone: "+15550101", license: "MD-CARD-101" },
            { name: "Dr. James Wilson", email: "james.wilson@clinic.com", spec: "Pediatrics", phone: "+15550102", license: "MD-PED-202" },
            { name: "Dr. Emily Chen", email: "emily.chen@clinic.com", spec: "Dermatology", phone: "+15550103", license: "MD-DERM-303" },
            { name: "Dr. Michael Change", email: "michael.chang@clinic.com", spec: "Orthopedics", phone: "+15550104", license: "MD-ORTH-404" },
            { name: "Dr. Lisa Ray", email: "lisa.ray@clinic.com", spec: "Neurology", phone: "+15550105", license: "MD-NEUR-505" },
            { name: "Dr. Robert Ford", email: "robert.ford@clinic.com", spec: "General Practice", phone: "+15550106", license: "MD-GP-606" },
            { name: "Dr. Amanda Lee", email: "amanda.lee@clinic.com", spec: "Psychiatry", phone: "+15550107", license: "MD-PSY-707" },
            { name: "Dr. David Kim", email: "david.kim@clinic.com", spec: "Ophthalmology", phone: "+15550108", license: "MD-OPH-808" },
            { name: "Dr. Jennifer Wu", email: "jennifer.wu@clinic.com", spec: "General Practice", phone: "+15550109", license: "MD-GP-909" },
            { name: "Dr. Thomas Brown", email: "thomas.brown@clinic.com", spec: "Cardiology", phone: "+15550110", license: "MD-CARD-1010" }
        ];

        const insertedDoctors = [];

        for (const doc of doctorProfiles) {
            // Create or get User ID
            const hashedPassword = await hashPassword("password123");

            // Upsert User
            await users.updateOne(
                { email: doc.email },
                {
                    $set: {
                        email: doc.email,
                        name: doc.name,
                        role: "doctor",
                        password: hashedPassword,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );

            // Fetch the actual user to get the consistent _id
            const user = await users.findOne({ email: doc.email });
            if (!user) continue;

            const availability = {
                monday: { start: "09:00", end: "17:00" },
                tuesday: { start: "09:00", end: "17:00" },
                wednesday: { start: "09:00", end: "17:00" },
                thursday: { start: "09:00", end: "17:00" },
                friday: { start: "09:00", end: "13:00" },
            };

            await doctors.updateOne(
                { email: doc.email },
                {
                    $set: {
                        userId: user._id,
                        name: doc.name,
                        email: doc.email,
                        phone: doc.phone,
                        specialization: doc.spec,
                        licenseNumber: doc.license,
                        availability,
                        isActive: true,
                        totalAppointments: Math.floor(Math.random() * 100),
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        _id: new ObjectId(),
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            const insertedDoc = await doctors.findOne({ email: doc.email });
            if (insertedDoc) insertedDoctors.push(insertedDoc);
        }
        console.log(`✅ Seeded ${insertedDoctors.length} doctors`);


        // 2. Create Patients
        console.log("Creating Patients...")
        const patientProfiles = [
            { name: "John Doe", phone: "+15551234567", email: "john.doe@example.com", dob: "1985-06-15", history: ["Hypertension"], allergy: ["Penicillin"] },
            { name: "Jane Roe", phone: "+15559876543", email: "jane.roe@example.com", dob: "1992-03-22", history: ["Migraines"], allergy: [] },
            { name: "Michael Brown", phone: "+15554567890", email: "michael.b@example.com", dob: "1978-11-05", history: [], allergy: ["Peanuts"] },
            { name: "Emily White", phone: "+15551112233", email: "emily.w@example.com", dob: "1990-01-15", history: ["Asthma"], allergy: ["Dust"] },
            { name: "Chris Green", phone: "+15552223344", email: "chris.g@example.com", dob: "1982-08-30", history: ["Diabetes Type 2"], allergy: [] },
            { name: "Patricia Black", phone: "+15553334455", email: "patricia.b@example.com", dob: "1970-05-12", history: ["Arthritis", "High Cholesterol"], allergy: ["Latex"] },
            { name: "Robert Blue", phone: "+15554445566", email: "robert.blue@example.com", dob: "1965-09-20", history: ["Cardiac Arrhythmia"], allergy: [] },
            { name: "Linda Yellow", phone: "+15555556677", email: "linda.y@example.com", dob: "1995-12-05", history: [], allergy: ["Sulfa drugs"] },
            { name: "David Orange", phone: "+15556667788", email: "david.o@example.com", dob: "1988-04-18", history: ["Eczema"], allergy: [] },
            { name: "Susan Purple", phone: "+15557778899", email: "susan.p@example.com", dob: "1980-02-28", history: ["Anxiety"], allergy: ["Aspirin"] },
            { name: "Kevin Red", phone: "+15558889900", email: "kevin.r@example.com", dob: "2000-07-07", history: [], allergy: [] },
            { name: "Laura Silver", phone: "+15559990011", email: "laura.s@example.com", dob: "1993-10-10", history: ["Hypothyroidism"], allergy: [] }
        ];

        const insertedPatients = [];
        for (const p of patientProfiles) {
            await patients.updateOne(
                { phone: p.phone },
                {
                    $set: {
                        name: p.name,
                        email: p.email,
                        phone: p.phone,
                        dob: new Date(p.dob),
                        address: `${Math.floor(Math.random() * 999) + 1} Random St, Cityville`,
                        medicalHistory: p.history,
                        allergies: p.allergy,
                        notes: "Regular patient.",
                        lastVisit: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 100))),
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        _id: new ObjectId(),
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );
            const insertedPatient = await patients.findOne({ phone: p.phone });
            if (insertedPatient) insertedPatients.push(insertedPatient);
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
            await appointments.deleteMany({});
            console.log("Cleared existing appointments for fresh seed.");
            await appointments.insertMany(appointmentData as any);
        }

        console.log(`✅ Seeded ${appointmentData.length} appointments`);
        console.log("🌱 Database seeding completed successfully!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        // Wait a small bit before exit to ensure logs flush
        setTimeout(() => process.exit(0), 100);
    }
}

seed();
