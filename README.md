# AI-Powered Medical Call Agent 🏥 🤖

A comprehensive, real-time AI voice agent designed for healthcare. It handles appointments, facilitates doctor-patient connections, and manages critical emergencies with geospatial intelligence and zero-latency routing.

---

## 📋 Project Overview

This Final Year Project (FYP) implements an **AI-powered voice assistant** that can:
- Answer incoming phone calls automatically
- Understand natural language speech using OpenAI GPT-4
- Classify caller intents (appointments, prescriptions, emergencies, doctor search)
- Respond with empathetic, contextual voice responses via Twilio
- Route critical emergencies to appropriate services (911/1122/999)
- Provide a real-time dashboard for operators to monitor calls

---

## 🚀 Key Features

### 🌟 Core Modules
| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time call monitoring with live transcripts via WebSockets |
| **Appointments** | Full scheduling system (list/detail views) for upcoming, past, and cancelled visits |
| **Doctors Directory** | Manage medical staff profiles, specializations, and availability. **Geospatial-enabled** for location-based searches |
| **Patient CRM** | Detailed patient history, medical records, allergies, and interaction logs |
| **Analytics** | Visual insights into call volume, intent distribution, and emergency statistics |
| **Settings** | Configurable clinic settings and system preferences |

### 🚨 Emergency Protocols (Real-World Ready)

| Phase | Trigger | Action |
|-------|---------|--------|
| **Phase 1: Geospatial Intelligence** | User mentions location (e.g., "I'm in Clifton") | Extract location, query database for nearby doctors using **MongoDB $near** |
| **Phase 2: Dynamic Routing** | AI detects `severity: critical` | Route based on caller country: **US→911**, **PK→1122**, **GB→999** |
| **Phase 3: Zero-Latency Handoff** | Keywords: "dying", "shot", "heart stopped" | Bypass AI entirely, connect in **< 2 seconds** |

### ⚡ Real-Time Interaction
- **Barge-In Support**: Callers can interrupt the AI naturally (full-duplex conversation)
- **Live Dashboard**: Watch calls appear instantly via WebSockets
- **Auto-Redirect**: Dashboard automatically focuses on active calls
- **Live Transcript**: Watch conversations unfold textually in real-time

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| **Backend** | Next.js API Routes (Serverless), MongoDB (with Geospatial Indexes) |
| **Real-time** | Socket.io (WebSockets) for live dashboard updates |
| **Voice/Telephony** | Twilio Voice API (TwiML, enhanced speech models, `Polly.Joanna-Neural`) |
| **AI/NLP** | OpenAI GPT-4 (Intent Classification, Emergency Detection, Response Generation) |
| **Authentication** | JWT-based login with role-based access (Admin/Operator) |

---

## 🧠 AI Modules

| Module | File | Purpose |
|--------|------|---------|
| **Intent Classifier** | `lib/ai/intent-classifier.ts` | Classifies speech into intents using GPT-4 |
| **Emergency Detector** | `lib/ai/emergency-detector.ts` | Analyzes transcripts for emergency severity (none → critical) |
| **Response Generator** | `lib/ai/response-generator.ts` | Generates empathetic AI responses for callers |
| **Location Service** | `lib/ai/location-service.ts` | Extracts location and queries MongoDB for nearby doctors |

---

## 📊 Data Models

| Model | Key Fields |
|-------|------------|
| **User** | email, password (hashed), role (admin/operator), name |
| **Doctor** | name, specialization, availability, location (GeoJSON), address |
| **Patient** | name, phone, dateOfBirth, allergies, medicalHistory |
| **Appointment** | patientId, doctorId, dateTime, status, notes |
| **Call** | callSid, callerNumber, transcript, intent, priority, emergencyDetected, aiResponse |

---

## 🔌 API Endpoints

| Category | Endpoints |
|----------|-----------|
| **Authentication** | `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` |
| **Twilio Webhooks** | `/api/twilio/voice`, `/api/twilio/process-speech`, `/api/twilio/status`, `/api/twilio/outbound` |
| **CRUD Operations** | `/api/appointments`, `/api/doctors`, `/api/patients`, `/api/calls`, `/api/users` |
| **Dashboard** | `/api/dashboard/stats` |

---

## 🇵🇰 Data Pack: Karachi Edition

The system is seeded with a **Karachi, Pakistan** logic pack:
- **Doctors**: Real hospital names (Aga Khan, South City, NICVD)
- **Locations**: Coordinates centered on Karachi (Clifton, DHA, Gulshan)
- **Patients**: Local names and demographics

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (running locally or Atlas)
- Twilio Account (SID, Auth Token, Phone Number)
- OpenAI API Key
- ngrok (for local development with Twilio)

### 2. Installation
```bash
git clone https://github.com/your-repo/ai-call-agent.git
cd ai-call-agent
npm install
```

### 3. Environment Setup
Create a `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-call-agent

# Auth
JWT_SECRET=your_secret_key

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# AI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app
```

### 4. Seed Data (Crucial!)
Populate the database with the Karachi Data Pack:
```bash
npx tsx scripts/seed-data.ts
```
*This creates 10 Doctors, 12 Patients, and 40 Appointments with valid geospatial data.*

### 5. Run Development Server
```bash
npm run dev
```

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Testing the Emergency Features

### Test Case 1: "Find a Doctor"
- **User**: "I need a heart specialist in Clifton."
- **AI**: Extracts "Clifton", queries DB for Cardiologists near coordinates, returns Dr. Ahmed at Aga Khan.

### Test Case 2: "Critical Emergency"
- **User**: "I'm having a heart attack! Help!"
- **AI**: Detects "heart attack" → Severity Critical → Checks country (PK) → **Dials 1122 immediately**.

### Test Case 3: "Zero Latency"
- **User**: "Person shot! Dying!"
- **System**: Bypasses LLM → **Connects to emergency services instantly**.

---

## 📁 Project Structure

```
ai-call-agent/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── twilio/        # Twilio webhooks
│   │   ├── calls/         # Call CRUD
│   │   ├── doctors/       # Doctor CRUD
│   │   └── ...
│   ├── dashboard/         # Main dashboard page
│   ├── appointments/      # Appointments module
│   ├── doctors/           # Doctors module
│   └── patients/          # Patients module
├── lib/                   # Shared utilities
│   ├── ai/               # AI modules
│   │   ├── intent-classifier.ts
│   │   ├── emergency-detector.ts
│   │   ├── response-generator.ts
│   │   └── location-service.ts
│   ├── mongodb.ts        # Database connection
│   ├── openai-client.ts  # OpenAI integration
│   └── twilio-client.ts  # Twilio integration
├── models/               # Mongoose-like schemas
├── components/           # React UI components
├── scripts/              # Seed and utility scripts
└── public/               # Static assets
```

---

## 🔮 Future Roadmap
- [ ] Integration with Google Maps API for real-time traffic routing
- [ ] WhatsApp integration for appointment reminders
- [ ] Multi-lingual support (Urdu/English automatic detection)
- [ ] Voicemail transcription and callback scheduling

---

## 👥 Team
- **Developer**: [Your Name]
- **Supervisor**: [Supervisor Name]
- **Institution**: [University Name]

---

## 📄 License
FYP Project - Educational Use Only.

---

## 📞 Demo

To test the system:
1. Start the server (`npm run dev` or `npm start`)
2. Expose via ngrok: `ngrok http 3000`
3. Configure Twilio webhook to: `https://your-ngrok-url/api/twilio/voice`
4. Call your Twilio number
5. Speak naturally and observe the AI respond!
