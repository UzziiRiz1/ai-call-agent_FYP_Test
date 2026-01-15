"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Phone, Mail, User, Eye, MapPin } from "lucide-react"
import Link from "next/link"
import type { IPatient } from "@/models/Patient"

export default function PatientsPage() {
    const [user, setUser] = useState<any>(null)
    const [patients, setPatients] = useState<IPatient[]>([])
    const [filteredPatients, setFilteredPatients] = useState<IPatient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, patientsRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/patients")
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (patientsRes.ok) {
                    const data = await patientsRes.json()
                    if (data.success) {
                        setPatients(data.patients)
                        setFilteredPatients(data.patients)
                    }
                }
            } catch (error) {
                console.error("Error fetching patients:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        const filtered = patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setFilteredPatients(filtered)
    }, [searchTerm, patients])

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Patients</h1>
                        <p className="text-muted-foreground">Manage patient records and history</p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Patient
                    </Button>
                </div>

                <Card className="p-6 mb-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, phone, or email..."
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
                    <div className="p-12 text-center text-muted-foreground">Loading patients...</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No patients found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <Card key={patient._id!.toString()} className="overflow-hidden hover:border-primary/50 transition-colors">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-1">{patient.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <Phone className="h-3 w-3" /> {patient.phone}
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {patient.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> {patient.email}
                                            </div>
                                        )}
                                        {patient.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-0.5" />
                                                <span className="truncate">{patient.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 flex justify-between items-center border-t">
                                    <div className="text-xs text-muted-foreground">
                                        Last Visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/patients/${patient._id}`}>
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
