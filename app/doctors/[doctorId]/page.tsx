"use client"

import { use, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stethoscope, Mail, Phone, Calendar, ArrowLeft, Clock, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { IDoctor } from "@/models/Doctor"

export default function DoctorDetailPage({ params }: { params: Promise<{ doctorId: string }> }) {
    const { doctorId } = use(params)
    const [user, setUser] = useState<any>(null)
    const [doctor, setDoctor] = useState<IDoctor | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<IDoctor>>({})
    const router = useRouter()

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, docRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch(`/api/doctors/${doctorId}`)
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (docRes.ok) {
                    const data = await docRes.json()
                    if (data.success) {
                        setDoctor(data.doctor)
                        setFormData(data.doctor)
                    }
                }
            } catch (error) {
                console.error("Error fetching doctor:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [doctorId])

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/doctors/${doctorId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setDoctor(formData as IDoctor)
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Error updating doctor:", error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this doctor? This cannot be undone.")) return

        try {
            const res = await fetch(`/api/doctors/${doctorId}`, { method: "DELETE" })
            if (res.ok) {
                router.push("/doctors")
            }
        } catch (error) {
            console.error("Error deleting doctor:", error)
        }
    }

    const handleAvailabilityChange = (day: string, type: "start" | "end", value: string) => {
        setFormData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...(prev.availability as any)?.[day],
                    [type]: value
                }
            }
        }))
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

    if (!doctor) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader user={user} />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-xl font-bold mb-4">Doctor Not Found</h2>
                    <Button asChild>
                        <Link href="/doctors">Back to List</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/doctors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Doctors
                        </Link>
                    </Button>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleUpdate}>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-primary/10 p-4 rounded-full mb-3">
                                    <Stethoscope className="h-10 w-10 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold">{doctor.name}</h1>
                                <p className="text-primary font-medium">{doctor.specialization}</p>
                                <Badge variant={doctor.isActive ? "default" : "secondary"} className="mt-2">
                                    {doctor.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div className="overflow-hidden">
                                        <div className="text-xs text-muted-foreground">Email</div>
                                        <div className="text-sm font-medium truncate">{doctor.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Phone</div>
                                        <div className="text-sm font-medium">{doctor.phone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Total Appointments</div>
                                        <div className="text-sm font-medium">{doctor.totalAppointments || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold mb-3 text-destructive">Danger Zone</h3>
                            <Button variant="destructive" className="w-full" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Doctor
                            </Button>
                        </Card>
                    </div>

                    {/* Details & Availability */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">Profile Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>License Number</Label>
                                    <Input
                                        value={isEditing ? formData.licenseNumber : doctor.licenseNumber}
                                        readOnly={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Specialization</Label>
                                    <Input
                                        value={isEditing ? formData.specialization : doctor.specialization}
                                        readOnly={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Clock className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold">Weekly Availability</h2>
                            </div>

                            <div className="space-y-4">
                                {days.map(day => (
                                    <div key={day} className="grid grid-cols-12 gap-4 items-center p-3 border rounded-lg">
                                        <span className="col-span-3 font-medium capitalize">{day}</span>
                                        {isEditing ? (
                                            <>
                                                <div className="col-span-4">
                                                    <Input
                                                        type="time"
                                                        value={(formData.availability as any)?.[day]?.start || ""}
                                                        onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1 text-center text-muted-foreground">to</div>
                                                <div className="col-span-4">
                                                    <Input
                                                        type="time"
                                                        value={(formData.availability as any)?.[day]?.end || ""}
                                                        onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="col-span-9 text-right text-muted-foreground">
                                                {(doctor.availability as any)?.[day] ? (
                                                    <span className="text-foreground">
                                                        {(doctor.availability as any)[day].start} - {(doctor.availability as any)[day].end}
                                                    </span>
                                                ) : "Unavailable"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
