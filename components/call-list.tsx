"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Clock, AlertTriangle } from "lucide-react"
import type { Call } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface CallListProps {
  calls: Call[]
  title: string
}

export function CallList({ calls, title }: CallListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in-progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getIntentLabel = (intent: string) => {
    return intent ? intent.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown"
  }

  // [FIX] Helper to prevent crashing on invalid dates
  const formatDateSafely = (dateInput: Date | string | undefined) => {
    try {
      if (!dateInput) return "Unknown time";
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "Invalid time";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Badge variant="secondary">{calls.length} calls</Badge>
      </div>

      <div className="space-y-3">
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No calls to display</p>
          </div>
        ) : (
          calls.map((call, index) => (
            <div
              // [FIX] Uses callId OR _id OR index as fallback to ensure unique key
              key={call.callId || (call as any)._id?.toString() || index}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{call.patientName || "Unknown Caller"}</p>
                    {call.emergencyDetected && (
                      <AlertTriangle className="h-4 w-4 text-destructive" title="Emergency Detected" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{call.phoneNumber}</p>
                </div>
                <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {getIntentLabel(call.intent)}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(call.priority)}`}>
                  {call.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{call.duration || 0}s</span>
                </div>
                {/* [FIX] Uses safe date formatter */}
                <span>{formatDateSafely(call.timestamp)}</span>
              </div>

              {call.transcript && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{call.transcript}</p>}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}