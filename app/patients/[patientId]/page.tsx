"use client"

import { use, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Phone, Mail, MapPin, Calendar, ArrowLeft, Save, Trash2, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { IPatient } from "@/models/Patient"

export default function PatientDetailPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = use(params)
    const [user, setUser] = useState<any>(null)
    const [patient, setPatient] = useState<IPatient | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<IPatient>>({})
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, patientRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch(`/api/patients/${patientId}`)
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (patientRes.ok) {
                    const data = await patientRes.json()
                    if (data.success) {
                        setPatient(data.patient)
                        setFormData(data.patient)
                    }
                }
            } catch (error) {
                console.error("Error fetching patient:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [patientId])

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setPatient(formData as IPatient)
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Error updating patient:", error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this patient? This cannot be undone.")) return

        try {
            const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" })
            if (res.ok) {
                router.push("/patients")
            }
        } catch (error) {
            console.error("Error deleting patient:", error)
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

    if (!patient) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader user={user} />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-xl font-bold mb-4">Patient Not Found</h2>
                    <Button asChild>
                        <Link href="/patients">Back to List</Link>
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
                        <Link href="/patients">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Patients
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
                    {/* Sidebar Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-primary/10 p-4 rounded-full mb-3">
                                    <User className="h-10 w-10 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold">{patient.name}</h1>
                                <p className="text-muted-foreground text-sm">Patient ID: {patient._id?.toString().slice(-6)}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Phone</div>
                                        <div className="text-sm font-medium">{patient.phone}</div>
                                    </div>
                                </div>
                                {patient.email && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div className="overflow-hidden">
                                            <div className="text-xs text-muted-foreground">Email</div>
                                            <div className="text-sm font-medium truncate">{patient.email}</div>
                                        </div>
                                    </div>
                                )}
                                {patient.address && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-xs text-muted-foreground">Address</div>
                                            <div className="text-sm font-medium">{patient.address}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Last Visit</div>
                                        <div className="text-sm font-medium">
                                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold mb-3 text-destructive">Danger Zone</h3>
                            <Button variant="destructive" className="w-full" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Patient
                            </Button>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info Edit Form */}
                        {isEditing && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Edit Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            value={formData.phone || ""}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={formData.email || ""}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input
                                            value={formData.address || ""}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Medical History */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Medical History</h2>
                            </div>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Label>Conditions (comma separated)</Label>
                                    <Textarea
                                        value={formData.medicalHistory?.join(", ") || ""}
                                        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                        placeholder="Hypertension, Diabetes, etc."
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                                        patient.medicalHistory.map((condition, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                                                {condition}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground italic">No medical history recorded.</p>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Allergies */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <h2 className="text-xl font-bold">Allergies</h2>
                            </div>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Label>Allergies (comma separated)</Label>
                                    <Textarea
                                        value={formData.allergies?.join(", ") || ""}
                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                        placeholder="Penicillin, Peanuts, etc."
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {patient.allergies && patient.allergies.length > 0 ? (
                                        patient.allergies.map((allergy, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-sm">
                                                {allergy}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground italic">No known allergies.</p>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Notes */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Clinical Notes</h2>
                            {isEditing ? (
                                <Textarea
                                    value={formData.notes || ""}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            ) : (
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {patient.notes || "No notes available."}
                                </p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
