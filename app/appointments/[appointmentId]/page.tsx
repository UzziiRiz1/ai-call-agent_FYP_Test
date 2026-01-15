"use client"

import { use, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone, ArrowLeft, MoreHorizontal, Check, X, AlertTriangle, FileText } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { IAppointment } from "@/models/Appointment"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AppointmentDetailPage({ params }: { params: Promise<{ appointmentId: string }> }) {
    const { appointmentId } = use(params)
    const [user, setUser] = useState<any>(null)
    const [appointment, setAppointment] = useState<IAppointment | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, aptRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch(`/api/appointments/${appointmentId}`)
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (aptRes.ok) {
                    const data = await aptRes.json()
                    if (data.success) {
                        setAppointment(data.appointment)
                    }
                }
            } catch (error) {
                console.error("Error fetching details:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [appointmentId])

    const updateStatus = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return

        try {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                setAppointment(prev => prev ? { ...prev, status: newStatus as any } : null)
            }
        } catch (error) {
            console.error("Error updating status:", error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this appointment? This cannot be undone.")) return

        try {
            const res = await fetch(`/api/appointments/${appointmentId}`, { method: "DELETE" })
            if (res.ok) {
                router.push("/appointments")
            }
        } catch (error) {
            console.error("Error deleting appointment:", error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "confirmed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            case "completed": return "bg-green-500/10 text-green-600 border-green-500/20"
            case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20"
            case "no-show": return "bg-orange-500/10 text-orange-600 border-orange-500/20"
            default: return "bg-gray-500/10 text-gray-600 border-gray-500/20"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader user={user} />
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader user={user} />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-xl font-bold mb-4">Appointment Not Found</h2>
                    <Button asChild>
                        <Link href="/appointments">Back to List</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link href="/appointments">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Appointments
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Main Info */}
                    <div className="flex-1 space-y-6">
                        <Card className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{appointment.patientName}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" /> {appointment.patientPhone}
                                    </div>
                                </div>
                                <Badge className={`${getStatusColor(appointment.status)} capitalize text-sm px-3 py-1`}>
                                    {appointment.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                    <Calendar className="h-8 w-8 text-primary/60" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Date</div>
                                        <div className="font-semibold">{format(new Date(appointment.appointmentDate), "EEEE, MMMM d, yyyy")}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                    <Clock className="h-8 w-8 text-primary/60" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Time</div>
                                        <div className="font-semibold">{appointment.appointmentTime} ({appointment.duration} min)</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                    <User className="h-8 w-8 text-primary/60" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Doctor</div>
                                        <div className="font-semibold">{appointment.doctorName}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                    <FileText className="h-8 w-8 text-primary/60" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Reason</div>
                                        <div className="font-semibold">{appointment.reason}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {appointment.notes && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-3">Notes</h2>
                                <div className="p-4 bg-muted rounded-md text-sm leading-relaxed">
                                    {appointment.notes}
                                </div>
                            </Card>
                        )}

                        {appointment.callId && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold mb-1">Source Call</h2>
                                        <p className="text-muted-foreground text-sm">This appointment was scheduled via AI call</p>
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link href={`/calls/${appointment.callId}`}>View Call Transcript</Link>
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="w-full md:w-80 space-y-6">
                        <Card className="p-6">
                            <h2 className="font-semibold mb-4">Actions</h2>
                            <div className="space-y-2">
                                {appointment.status === 'scheduled' && (
                                    <Button className="w-full justify-start" variant="outline" onClick={() => updateStatus('confirmed')}>
                                        <Check className="h-4 w-4 mr-2 text-green-600" />
                                        Confirm Appointment
                                    </Button>
                                )}
                                {appointment.status !== 'cancelled' && (
                                    <Button className="w-full justify-start" variant="outline" onClick={() => updateStatus('cancelled')}>
                                        <X className="h-4 w-4 mr-2 text-red-600" />
                                        Cancel Appointment
                                    </Button>
                                )}
                                {appointment.status !== 'no-show' && (
                                    <Button className="w-full justify-start" variant="outline" onClick={() => updateStatus('no-show')}>
                                        <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                                        Mark No-Show
                                    </Button>
                                )}

                                <div className="h-px bg-border my-4" />

                                <Button className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" variant="ghost" onClick={handleDelete}>
                                    Delete Permanently
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
