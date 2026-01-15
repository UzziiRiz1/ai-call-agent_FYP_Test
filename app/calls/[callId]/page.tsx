"use client"

import { use, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Clock, AlertTriangle, ArrowLeft, MessageSquare, Mic, ExternalLink } from "lucide-react"
import type { Call } from "@/lib/types"
import { format } from "date-fns"
import Link from "next/link"

export default function CallDetailPage({ params }: { params: Promise<{ callId: string }> }) {
  const { callId } = use(params)
  const [user, setUser] = useState<any>(null)
  const [call, setCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const fetchData = async () => {
      try {
        const [userRes, callRes] = await Promise.all([
          // Only fetch user on initial load if not set, or we could separate this. 
          // For simplicity, we'll keep it but typically we'd separate user fetch.
          user ? Promise.resolve({ ok: true, json: async () => ({ user }) }) : fetch("/api/auth/me"),
          fetch(`/api/calls/${callId}`)
        ])

        if (userRes.ok && !user) {
          const userData = await userRes.json()
          setUser(userData.user)
        }

        if (callRes.ok) {
          const callData = await callRes.json()
          setCall(callData.call)

          // If call is active/in-progress, continue polling
          if (["active", "in-progress", "ringing"].includes(callData.call.status)) {
            // Polling logic is handled by setting interval below
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching call details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    pollInterval = setInterval(fetchData, 1000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [callId, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in-progress":
      case "ringing":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading call details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Call Not Found</h2>
            <p className="text-muted-foreground mb-6">The call you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/calls">Back to Calls</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/calls">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calls
          </Link>
        </Button>

        <div className="grid gap-6">
          {/* Header Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{call.patientName}</h1>
                  <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                  {call.emergencyDetected && (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Emergency
                    </Badge>
                  )}
                  {call.direction && (
                    <Badge variant="outline" className="capitalize">
                      {call.direction}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono">{call.callId}</p>
                {call.callSid && (
                  <p className="text-xs text-muted-foreground font-mono mt-1">Twilio SID: {call.callSid}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Phone Number</span>
                </div>
                <p className="font-medium text-foreground">{call.phoneNumber}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="font-medium text-foreground">{call.duration} seconds</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Intent</span>
                </div>
                <p className="font-medium text-foreground capitalize">{call.intent.replace("_", " ")}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Priority</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {call.priority}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Timestamps */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Timeline</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Call Started</p>
                <p className="font-medium text-foreground">{format(new Date(call.timestamp), "PPpp")}</p>
              </div>
              {call.completedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Call Completed</p>
                  <p className="font-medium text-foreground">{format(new Date(call.completedAt), "PPpp")}</p>
                </div>
              )}
              {call.initiatedBy && (
                <div>
                  <p className="text-sm text-muted-foreground">Initiated By</p>
                  <p className="font-medium text-foreground">{call.initiatedBy}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recording */}
          {call.recordingUrl && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Call Recording
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recording Duration</p>
                  <p className="font-medium text-foreground">{call.recordingDuration || 0} seconds</p>
                </div>
                <Button variant="outline" asChild>
                  <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Listen to Recording
                  </a>
                </Button>
                {call.recordingSid && (
                  <p className="text-xs text-muted-foreground font-mono">Recording SID: {call.recordingSid}</p>
                )}
              </div>
            </Card>
          )}

          {/* Emergency Details */}
          {call.emergencyDetected && call.emergencyKeywords && call.emergencyKeywords.length > 0 && (
            <Card className="p-6 border-red-500/20 bg-red-500/5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Emergency Details
              </h2>
              <div className="space-y-3">
                {call.emergencySeverity && (
                  <div>
                    <p className="text-sm text-muted-foreground">Severity</p>
                    <Badge className="capitalize bg-red-500/10 text-red-600 border-red-500/20">
                      {call.emergencySeverity}
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Detected Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {call.emergencyKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-red-600 border-red-500/20">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Transcript */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Call Transcript</h2>
            {call.transcript ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{call.transcript}</p>
                </div>
                {call.transcriptConfidence !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Confidence: {(call.transcriptConfidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No transcript available</p>
            )}
          </Card>

          {/* Full Transcript from Twilio */}
          {call.fullTranscript && call.fullTranscript !== call.transcript && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Complete Transcription</h2>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{call.fullTranscript}</p>
              </div>
              {call.transcriptionStatus && (
                <p className="text-sm text-muted-foreground mt-2">Status: {call.transcriptionStatus}</p>
              )}
            </Card>
          )}

          {/* AI Response */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">AI Response</h2>
            {call.aiResponse ? (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{call.aiResponse}</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No AI response generated yet</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
