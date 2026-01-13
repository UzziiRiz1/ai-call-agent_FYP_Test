# AI-Powered Voice Calling Agent

A comprehensive AI-powered medical call handling system with real-time monitoring, intent recognition, and emergency detection capabilities. Built for healthcare providers to efficiently manage patient communications with **Twilio integration** for actual voice calling.

## Features

### Core Functionality
- **Real-time Dashboard** - Live call monitoring with WebSocket updates
- **Twilio Voice Integration** - Handle real inbound and outbound calls
- **Call Recording & Transcription** - Automatic recording and speech-to-text
- **AI Intent Classification** - Automatic categorization of calls (appointments, prescriptions, general inquiries, emergencies)
- **Emergency Detection** - Instant identification and prioritization of critical calls with automatic routing
- **Call Management** - Complete CRUD operations with detailed call history
- **Analytics & Insights** - Comprehensive statistics and intent distribution charts
- **Admin Panel** - User management and system analytics
- **Role-Based Access** - Admin and operator roles with appropriate permissions

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, MongoDB, WebSocket (Socket.io)
- **Telephony**: Twilio Voice API with TwiML
- **Authentication**: JWT with HTTP-only cookies, bcrypt password hashing
- **AI Processing**: Custom intent classifier and emergency detector
- **Real-time**: Socket.io for live dashboard updates
- **UI Components**: shadcn/ui, Radix UI, Recharts for data visualization

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud instance like MongoDB Atlas)
- **Twilio Account** with:
  - Account SID and Auth Token
  - Phone number with Voice capabilities
  - Configured webhook URLs
- npm or yarn package manager

### Installation

1. **Clone or download the project**

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-call-agent
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-call-agent

# JWT Secret (generate a random secure string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App URL (for WebSocket and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Emergency Phone Number (for routing critical calls)
EMERGENCY_PHONE_NUMBER=+1911
```

4. **Set up Twilio Webhooks**

In your Twilio Console, configure your phone number with these webhooks:

- **Voice & Fax > Configure > A Call Comes In**:
  - URL: `https://your-domain.com/api/twilio/voice`
  - HTTP Method: POST

- **Voice & Fax > Configure > Call Status Changes**:
  - URL: `https://your-domain.com/api/twilio/status`
  - HTTP Method: POST

Note: For local development, use ngrok or similar tools to expose your local server:
```bash
ngrok http 3000
```

5. **Initialize the database**
```bash
npm run init-db
```

This creates:
- Database collections with proper indexes
- Default admin user: `admin@example.com` / `admin123`
- Default operator user: `operator@example.com` / `operator123`
- Sample calls for demonstration

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**

Navigate to `http://localhost:3000`

## Usage

### Login
Use the demo credentials:
- **Admin**: `admin@example.com` / `admin123`
- **Operator**: `operator@example.com` / `operator123`

### Dashboard
- View real-time call statistics
- Monitor active calls
- See recent call history
- Analyze intent distribution
- Click "Make Outbound Call" to initiate real calls via Twilio
- Click "Simulate Call for Demo" to generate sample data

### Making Outbound Calls
1. Click "Make Outbound Call" on the dashboard
2. Enter the recipient's phone number (international format: +1234567890)
3. Enter the message to be spoken
4. Click "Make Call" to initiate via Twilio

### Receiving Inbound Calls
1. Call your Twilio phone number
2. The AI agent will greet the caller
3. Caller speaks their request
4. AI processes intent and emergency detection
5. System provides appropriate response
6. Critical emergencies are automatically routed

### Call Management
- Navigate to the calls page to view all calls
- Search and filter by status (active, completed, failed)
- Click on any call to view:
  - Complete transcripts
  - Call recordings (listen online)
  - AI-generated responses
  - Emergency details (if detected)
  - Twilio metadata

### Admin Panel
- Access admin panel (admin role required)
- Create new users with roles
- View system analytics
- Manage existing users

## Twilio Integration Details

### Inbound Call Flow
1. User calls Twilio number
2. Twilio webhook triggers `/api/twilio/voice`
3. System creates call record in database
4. TwiML response with AI greeting
5. Speech input gathered and sent to `/api/twilio/process-speech`
6. AI analyzes intent and emergency status
7. System responds with appropriate TwiML
8. Critical emergencies routed to emergency line
9. Call recording and transcription saved

### Outbound Call Flow
1. User initiates call from dashboard
2. API creates Twilio call via REST API
3. Twilio makes call to recipient
4. TwiML from `/api/twilio/outbound-twiml` speaks message
5. Optional: Gather recipient response
6. Status updates via webhooks
7. Recording and transcription saved

### Voice Features
- **Neural TTS**: Uses Amazon Polly Joanna-Neural voice
- **Enhanced Speech Recognition**: Twilio's enhanced speech model
- **Automatic Recording**: All calls recorded by default
- **Real-time Transcription**: Speech-to-text with confidence scores
- **Emergency Routing**: Critical calls automatically transferred

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── calls/             # Call management endpoints
│   │   ├── dashboard/         # Dashboard statistics
│   │   ├── admin/             # Admin-only endpoints
│   │   └── twilio/            # Twilio webhook handlers
│   │       ├── voice/         # Inbound call handler
│   │       ├── process-speech/# Speech processing
│   │       ├── status/        # Status callbacks
│   │       ├── recording/     # Recording callbacks
│   │       ├── transcribe/    # Transcription callbacks
│   │       ├── outbound/      # Outbound call API
│   │       └── outbound-twiml/# Outbound TwiML generator
│   ├── admin/                 # Admin panel pages
│   ├── calls/                 # Call management pages
│   ├── dashboard/             # Main dashboard page
│   ├── login/                 # Login page
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard-header.tsx   # Dashboard navigation
│   ├── stats-card.tsx         # Statistics display
│   ├── call-list.tsx          # Call listing component
│   ├── intent-chart.tsx       # Intent distribution chart
│   └── outbound-call-dialog.tsx # Outbound calling UI
├── lib/
│   ├── ai/                    # AI processing modules
│   │   ├── intent-classifier.ts    # Intent recognition
│   │   ├── emergency-detector.ts   # Emergency detection
│   │   └── response-generator.ts   # AI response generation
│   ├── mongodb.ts             # Database connection
│   ├── auth.ts                # Authentication utilities
│   ├── types.ts               # TypeScript types
│   ├── twilio-client.ts       # Twilio SDK utilities
│   └── websocket-server.ts    # WebSocket setup
├── scripts/
│   └── init-database.ts       # Database initialization
└── proxy.ts                   # Route protection middleware
```

## AI Processing

### Intent Classification
The system analyzes call transcripts and classifies them into:
- **Appointment** - Scheduling, rescheduling, or canceling appointments
- **Prescription** - Medication refills and prescription requests
- **General Inquiry** - Information requests, billing, insurance questions
- **Emergency** - Critical situations requiring immediate attention

### Emergency Detection
Monitors for emergency keywords such as:
- Chest pain, difficulty breathing, severe pain
- Unconscious, seizure, bleeding heavily
- Heart attack, stroke, overdose

### Priority Assignment
Automatically assigns priority levels:
- **Critical** - Emergencies requiring immediate response
- **High** - Urgent matters needing prompt attention
- **Medium** - Standard priority
- **Low** - General inquiries

## Real-time Updates

The system uses WebSocket connections to provide live updates:
- New calls appear instantly on the dashboard
- Call status changes reflect in real-time
- Emergency alerts are immediately visible
- Statistics update automatically

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **HTTP-only Cookies** - Protection against XSS attacks
- **Password Hashing** - bcrypt with salt rounds
- **Role-based Access Control** - Admin and operator permissions
- **Route Protection** - Middleware guards protected routes
- **Session Management** - 24-hour token expiration
- **Twilio Signature Verification** - Validates webhook authenticity

## Production Deployment

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-production-jwt-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Twilio Production Credentials
TWILIO_ACCOUNT_SID=your_production_twilio_account_sid
TWILIO_AUTH_TOKEN=your_production_twilio_auth_token
TWILIO_PHONE_NUMBER=your_production_phone_number
EMERGENCY_PHONE_NUMBER=+1911
```

### Build and Deploy
```bash
npm run build
npm run start
```

### Deployment Checklist
- [ ] Set up production MongoDB database
- [ ] Configure production Twilio account
- [ ] Update Twilio webhooks with production URLs
- [ ] Set secure JWT secret
- [ ] Enable HTTPS for webhook security
- [ ] Test emergency call routing
- [ ] Verify call recording permissions
- [ ] Set up monitoring and alerts

## Troubleshooting

### Twilio Issues
- **Webhooks not working**: Ensure your server is publicly accessible (use ngrok for local dev)
- **No transcription**: Check Twilio console for transcription status
- **Recording not saved**: Verify recording callbacks are configured
- **Emergency routing fails**: Confirm EMERGENCY_PHONE_NUMBER is set correctly

### Common Issues
- **WebSocket disconnects**: Check NEXT_PUBLIC_APP_URL matches your deployment
- **Authentication fails**: Verify JWT_SECRET is set consistently
- **Database errors**: Ensure MongoDB URI is correct and database is accessible

## FYP Project Details

This is a Final Year Project (FYP) demonstrating:
- Full-stack Next.js development
- Real-time communication with WebSocket
- **Twilio Voice API integration**
- **TwiML programming**
- **Speech recognition and synthesis**
- AI/ML integration for text classification
- Healthcare-focused application design
- Secure authentication and authorization
- Database design and optimization
- RESTful API development
- Modern UI/UX practices
- Webhook handling and security

## Future Enhancements

Potential additions for future versions:
- Multi-language support with Twilio translations
- Advanced AI models (LLMs) for better intent recognition
- SMS/Email notifications for emergencies via Twilio
- Video calling with Twilio Video
- Call queuing and distribution
- IVR (Interactive Voice Response) menus
- Sentiment analysis during calls
- Integration with hospital management systems
- Mobile app for on-the-go monitoring
- Advanced analytics and reporting
- Call center features (transfer, conference, hold)

## License

This project is created for educational purposes as part of a Final Year Project.

## Support

For issues or questions related to this project, please refer to the project documentation or contact the development team.

For Twilio-specific issues, consult the [Twilio Documentation](https://www.twilio.com/docs/voice).

---

Built with Next.js 16, React 19, Twilio Voice API, and modern web technologies.
