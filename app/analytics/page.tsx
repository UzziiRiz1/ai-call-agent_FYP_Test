"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IntentChart } from "@/components/intent-chart"
import { BarChart3, TrendingUp, Clock, PhoneMissed, PhoneIncoming, Calendar } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

export default function AnalyticsPage() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Re-using dashboard stats API for now, would typically be a dedicated analytics endpoint
        const fetchData = async () => {
            try {
                const [userRes, statsRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/dashboard/stats")
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData)
                }
            } catch (error) {
                console.error("Error fetching analytics:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const intentChartData = stats
        ? [
            { name: "Appointment", value: stats.intentDistribution.appointment || 0 },
            { name: "Prescription", value: stats.intentDistribution.prescription || 0 },
            { name: "General Inquiry", value: stats.intentDistribution.general_inquiry || 0 },
            { name: "Emergency", value: stats.intentDistribution.emergency || 0 },
        ]
        : []

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
                        <p className="text-muted-foreground">Key performance indicators and call insights</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Last 30 Days
                        </Button>
                        <Button>Export Report</Button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading analytics...</div>
                ) : (
                    <div className="space-y-6">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Volume</h3>
                                    <PhoneIncoming className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-2xl font-bold">{stats?.totalCalls || 0}</div>
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from last month
                                </p>
                            </Card>
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Avg Duration</h3>
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-2xl font-bold">{stats?.averageDuration || 0}s</div>
                                <p className="text-xs text-muted-foreground mt-1">Target: &lt;120s</p>
                            </Card>
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Missed Calls</h3>
                                    <PhoneMissed className="h-4 w-4 text-red-500" />
                                </div>
                                <div className="text-2xl font-bold">2</div>
                                <p className="text-xs text-red-600 mt-1">Requires attention</p>
                            </Card>
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Conversion</h3>
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-2xl font-bold">48%</div>
                                <p className="text-xs text-muted-foreground mt-1">Appts booked / Total calls</p>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-[400px]">
                                <IntentChart data={intentChartData} />
                            </div>
                            <Card className="p-6">
                                <h3 className="font-semibold mb-6">Call Volume (Weekly)</h3>
                                <div className="h-[300px] flex items-end justify-between gap-2 px-2">
                                    {[45, 60, 75, 50, 80, 20, 10].map((h, i) => (
                                        <div key={i} className="w-full bg-primary/20 rounded-t-md hover:bg-primary/40 transition-colors relative group" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {h} calls
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-muted-foreground px-2">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
