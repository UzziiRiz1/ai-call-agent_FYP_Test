"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Filter, Plus, Clock, User, Phone, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { IAppointment } from "@/models/Appointment"

export default function AppointmentsPage() {
    const [user, setUser] = useState<any>(null)
    const [appointments, setAppointments] = useState<IAppointment[]>([])
    const [filteredAppointments, setFilteredAppointments] = useState<IAppointment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, appointmentsRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/appointments")
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (appointmentsRes.ok) {
                    const data = await appointmentsRes.json()
                    if (data.success) {
                        setAppointments(data.appointments)
                        setFilteredAppointments(data.appointments)
                    }
                }
            } catch (error) {
                console.error("Error fetching appointments:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        const filtered = appointments.filter(apt =>
            apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredAppointments(filtered)
    }, [searchTerm, appointments])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "completed": return "bg-green-500/10 text-green-600 border-green-500/20"
            case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20"
            default: return "bg-gray-500/10 text-gray-600 border-gray-500/20"
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
                        <p className="text-muted-foreground">Manage scheduled appointments</p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Appointment
                    </Button>
                </div>

                <Card className="p-6 mb-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search patient or doctor..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">Loading appointments...</div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No appointments found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="p-4 text-left font-medium">Patient</th>
                                        <th className="p-4 text-left font-medium">Doctor</th>
                                        <th className="p-4 text-left font-medium">Date & Time</th>
                                        <th className="p-4 text-left font-medium">Status</th>
                                        <th className="p-4 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map((apt) => (
                                        <tr key={apt._id!.toString()} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{apt.patientName}</div>
                                                <div className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                                                    <Phone className="h-3 w-3" /> {apt.patientPhone}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {apt.doctorName}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {format(new Date(apt.appointmentDate), "MMM d, yyyy")}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    {apt.appointmentTime} ({apt.duration} min)
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`${getStatusColor(apt.status)} capitalize`}>
                                                    {apt.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/appointments/${apt._id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
