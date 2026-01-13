"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCard } from "@/components/stats-card"
import { CallList } from "@/components/call-list"
import { IntentChart } from "@/components/intent-chart"
import { Phone, CheckCircle, AlertTriangle, Activity, Clock } from "lucide-react"
import type { Call, DashboardStats } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { OutboundCallDialog } from "@/components/outbound-call-dialog"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeCalls, setActiveCalls] = useState<Call[]>([])
  const [recentCalls, setRecentCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [userRes, statsRes, activeRes, recentRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/dashboard/stats"),
        fetch("/api/calls?status=active"),
        fetch("/api/calls?limit=10"),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveCalls(activeData.calls || [])
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json()
        setRecentCalls(recentData.calls || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const pollInterval = setInterval(() => {
      fetchData()
    }, 5000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [])

  const intentChartData = stats
    ? [
        { name: "Appointment", value: stats.intentDistribution.appointment || 0 },
        { name: "Prescription", value: stats.intentDistribution.prescription || 0 },
        { name: "General Inquiry", value: stats.intentDistribution.general_inquiry || 0 },
        { name: "Emergency", value: stats.intentDistribution.emergency || 0 },
      ]
    : []

  const handleSimulateCall = async () => {
    try {
      await fetch("/api/calls/simulate", { method: "POST" })
      setTimeout(() => fetchData(), 1000)
    } catch (error) {
      console.error("Error simulating call:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Calls"
            value={stats?.totalCalls || 0}
            icon={Phone}
            colorClass="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Active Calls"
            value={stats?.activeCalls || 0}
            icon={Activity}
            colorClass="bg-blue-500/10 text-blue-600"
          />
          <StatsCard
            title="Completed"
            value={stats?.completedCalls || 0}
            icon={CheckCircle}
            colorClass="bg-green-500/10 text-green-600"
          />
          <StatsCard
            title="Emergencies"
            value={stats?.emergencyCalls || 0}
            icon={AlertTriangle}
            colorClass="bg-red-500/10 text-red-600"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCard
            title="Avg. Call Duration"
            value={`${stats?.averageDuration || 0}s`}
            icon={Clock}
            colorClass="bg-purple-500/10 text-purple-600"
          />
          <div className="flex items-center gap-4 justify-center">
            <OutboundCallDialog />
            <Button onClick={handleSimulateCall} variant="outline" size="lg">
              Simulate Call for Demo
            </Button>
          </div>
        </div>

        {/* Intent Chart */}
        <div className="mb-8">
          <IntentChart data={intentChartData} />
        </div>

        {/* Call Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CallList calls={activeCalls} title="Active Calls" />
          <CallList calls={recentCalls} title="Recent Calls" />
        </div>
      </div>
    </div>
  )
}
