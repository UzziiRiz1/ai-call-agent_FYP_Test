# AI-Powered Medical Call Agent 🏥 🤖

A comprehensive, real-time AI voice agent designed for healthcare. It handles appointments, facilitates doctor-patient connections, and manages critical emergencies with geospatial intelligence and zero-latency routing.

## 🚀 Key Features

### 🌟 Core Modules
- **Appointments Management**: Full scheduling system (List/Detail views) to track upcoming, past, and cancelled visits.
- **Doctors Directory**: Manage medical staff profiles, specializations, and availability. **Geospatial-enabled** for location-based searches.
- **Patient CRM**: Detailed patient history, medical records, allergies, and interaction logs.
- **Settings & Analytics**: Configurable clinic settings and visual insights into call volume and intents.

### 🚨 Emergency Protocols (Real-World Ready)
- **Phase 1: Geospatial Intelligence**: The AI extracts user location (e.g., "I'm in Clifton") and queries the database for nearby doctors using **MongoDB Geospatial ($near)** queries.
- **Phase 2: Dynamic Actionable Routing**: Automatically routes critical calls based on caller country:
  - **US**: Dials 911
  - **PK**: Dials 1122
  - **GB**: Dials 999
- **Phase 3: Zero-Latency Handoff**: Hard-coded overrides for words like "dying", "shot", or "heart stopped" bypass the AI for immediate connection (< 2s latency).

### ⚡ Real-Time Interaction
- **Barge-In Support**: Callers can interrupt the AI naturally (full-duplex conversation).
- **Live Dashboard**: Watch calls appear instantly via WebSockets.
- **Auto-Redirect**: Dashboard automatically focuses on the active call when it rings.
- **Live Transcript**: Watch the conversation unfold textually in real-time.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB (Standard + Geospatial), Socket.io
- **AI & Voice**: 
  - **Twilio Voice API** (TwiML, Media Streams)
  - **OpenAI GPT-4** (Intent Classification & Emergency Logic)
  - **Node.js** Environment

---

## 🇵🇰 Data Pack: Karachi Edition
The system is currently seeded with a **Karachi, Pakistan** logic pack:
- **Doctors**: Real hospital names (Aga Khan, South City, NICVD).
- **Locations**: Coordinates centered on Karachi (Clifton, DHA, Gulshan).
- **Patients**: Local names and demographics.

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (running locally or Atlas)
- Twilio Account (SID, Auth Token, Phone Number)
- OpenAI API Key

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

---

## 🧪 Testing the Emergency Features

1.  **"Find a Doctor"**:
    *   *User*: "I need a heart specialist in Clifton."
    *   *AI*: Extracts "Clifton", queries DB for Cardiologists near coordinates [67.0281, 24.8138], and returns Dr. Ahmed at Aga Khan.

2.  **"Critical Emergency"**:
    *   *User*: "I'm having a heart attack! Help!"
    *   *AI*: Detects "heart attack" -> Severity Critical -> Routing logic checks country (PK) -> **Dials 1122 immediately**.

3.  **"Zero Latency"**:
    *   *User*: "Person shot! Dying!"
    *   *System*: Bypasses LLM -> **Connects to emergency services instantly**.

---

## 🔮 Future Roadmap
- [ ] Integration with Google Maps API for real-time traffic routing.
- [ ] WhatsApp integration for appointment reminders.
- [ ] Multi-lingual support (Urdu/English mixed mode).

---

## 📄 License
FYP Project - Educational Use Only.
