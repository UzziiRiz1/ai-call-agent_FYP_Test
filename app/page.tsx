import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, Brain, Shield, Zap, Clock, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">AI Call Agent</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Powered by Advanced AI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 text-foreground">
              Intelligent Voice Calling Agent for Healthcare
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance mb-8 leading-relaxed">
              Handle patient calls with confidence. Our AI-powered system recognizes intent, detects emergencies, and
              provides real-time insights for better healthcare delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Powerful Features Built for Healthcare
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Everything you need to manage patient calls efficiently and safely
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Intent Recognition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically classify calls into appointments, prescriptions, general inquiries, or emergencies with
                advanced AI.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Emergency Detection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time detection of critical situations with instant alerts and priority routing to medical staff.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Real-time Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Live dashboard updates via WebSocket for instant visibility into all active and completed calls.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Call Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete call lifecycle management from initiation to completion with detailed transcripts and
                analytics.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Advanced Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive insights into call patterns, intent distribution, and performance metrics.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">AI-Powered Responses</h3>
              <p className="text-muted-foreground leading-relaxed">
                Intelligent response generation tailored to each call type for consistent, professional communication.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Simple, efficient workflow powered by advanced AI
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Call Received</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Patient calls are automatically captured and processed by the AI system with real-time transcription.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">AI Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced algorithms classify the call intent and scan for emergency keywords to determine priority and
                  routing.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Smart Response</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI generates appropriate responses based on call type and urgency, ensuring professional and accurate
                  communication.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Real-time Updates</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dashboard receives instant updates via WebSocket, keeping your team informed of all call activities
                  and emergencies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Transform Your Healthcare Communications
              </h2>
              <p className="text-lg text-muted-foreground text-balance">
                Deliver better patient care with AI-powered call management
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">For Healthcare Providers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      Reduce response time to patient inquiries
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">Never miss critical emergency calls</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      Improve operational efficiency with automation
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">For Patients</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">24/7 availability for urgent needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">Faster routing to appropriate care</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      Consistent, professional communication
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-primary text-primary-foreground">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Call Management?</h2>
              <p className="text-lg text-primary-foreground/90 mb-8 text-balance">
                Join healthcare providers using AI to deliver better patient care
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">Start Now</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">AI Call Agent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 AI Call Agent. FYP Project - Medical Call Handling System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
