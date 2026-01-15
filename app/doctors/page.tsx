"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Phone, Mail, Stethoscope, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import type { IDoctor } from "@/models/Doctor"

import { AddDoctorDialog } from "@/components/add-doctor-dialog"

export default function DoctorsPage() {
    const [user, setUser] = useState<any>(null)
    const [doctors, setDoctors] = useState<IDoctor[]>([])
    const [filteredDoctors, setFilteredDoctors] = useState<IDoctor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, doctorsRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/doctors")
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (doctorsRes.ok) {
                    const data = await doctorsRes.json()
                    if (data.success) {
                        setDoctors(data.doctors)
                        setFilteredDoctors(data.doctors)
                    }
                }
            } catch (error) {
                console.error("Error fetching doctors:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [refreshTrigger])

    useEffect(() => {
        const filtered = doctors.filter(doc =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredDoctors(filtered)
    }, [searchTerm, doctors])

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Doctors</h1>
                        <p className="text-muted-foreground">Manage medical staff and profiles</p>
                    </div>
                    <AddDoctorDialog onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
                </div>

                <Card className="p-6 mb-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, specialization, or email..."
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

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading doctors...</div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No doctors found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <Card key={doctor._id!.toString()} className="overflow-hidden hover:border-primary/50 transition-colors">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <Stethoscope className="h-6 w-6 text-primary" />
                                        </div>
                                        <Badge variant={doctor.isActive ? "default" : "secondary"}>
                                            {doctor.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>

                                    <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
                                    <p className="text-primary font-medium mb-4">{doctor.specialization}</p>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" /> {doctor.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" /> {doctor.phone}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> {Object.keys(doctor.availability || {}).length} days available
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 flex justify-between items-center border-t">
                                    <div className="text-xs text-muted-foreground">
                                        {doctor.totalAppointments || 0} Appointments
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/doctors/${doctor._id}`}>
                                            View Profile <Eye className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
