"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Phone, Search, Eye } from "lucide-react"
import type { Call } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { OutboundCallDialog } from "@/components/outbound-call-dialog"

export default function CallsPage() {
  const [user, setUser] = useState<any>(null)
  const [calls, setCalls] = useState<Call[]>([])
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, callsRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/calls?limit=100")])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
        }

        if (callsRes.ok) {
          const callsData = await callsRes.json()
          setCalls(callsData.calls || [])
          setFilteredCalls(callsData.calls || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching calls:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = calls

    if (searchTerm) {
      filtered = filtered.filter(
        (call) =>
          call.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.phoneNumber.includes(searchTerm) ||
          call.callId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((call) => call.status === statusFilter)
    }

    setFilteredCalls(filtered)
  }, [searchTerm, statusFilter, calls])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Call Management</h1>
            <p className="text-muted-foreground">View and manage all calls in the system</p>
          </div>
          <div className="flex gap-2">
            <OutboundCallDialog />
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <Phone className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, phone, or call ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                onClick={() => setStatusFilter("completed")}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === "failed" ? "default" : "outline"}
                onClick={() => setStatusFilter("failed")}
                size="sm"
              >
                Failed
              </Button>
            </div>
          </div>
        </Card>

        {/* Calls Table */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-muted-foreground">Loading calls...</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">No calls found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCalls.map((call) => (
                <div
                  key={call.callId}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{call.patientName}</h3>
                        <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                        {call.emergencyDetected && (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Emergency</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Call ID</p>
                          <p className="font-mono text-xs">{call.callId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p>{call.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intent</p>
                          <p className="capitalize">{call.intent.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p>{call.duration}s</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/calls/${call.callId}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
