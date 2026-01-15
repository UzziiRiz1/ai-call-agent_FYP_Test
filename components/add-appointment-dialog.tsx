"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/utils"

export function AddAppointmentDialog({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [doctors, setDoctors] = useState<any[]>([])

    const [formData, setFormData] = useState({
        patientName: "",
        patientPhone: "",
        patientEmail: "",
        doctorId: "",
        appointmentDate: new Date(),
        appointmentTime: "09:00",
        reason: ""
    })

    useEffect(() => {
        if (open) {
            fetch("/api/doctors?isActive=true")
                .then(res => res.json())
                .then(data => {
                    if (data.success) setDoctors(data.doctors)
                })
                .catch(err => console.error(err))
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setOpen(false)
                setFormData({
                    patientName: "",
                    patientPhone: "",
                    patientEmail: "",
                    doctorId: "",
                    appointmentDate: new Date(),
                    appointmentTime: "09:00",
                    reason: ""
                })
                if (onSuccess) onSuccess()
            } else {
                // Handle error
                const data = await res.json()
                alert(data.error || "Failed to create appointment")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a new consultation. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="patientName" className="text-right">Name</Label>
                        <Input
                            id="patientName"
                            value={formData.patientName}
                            onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.patientPhone}
                            onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doctor" className="text-right">Doctor</Label>
                        <Select
                            value={formData.doctorId}
                            onValueChange={v => setFormData({ ...formData, doctorId: v })}
                            required
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map(doc => (
                                    <SelectItem key={doc._id} value={doc._id}>{doc.name} ({doc.specialization})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Date</Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.appointmentDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.appointmentDate ? format(formData.appointmentDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.appointmentDate}
                                        onSelect={(date: Date | undefined) => date && setFormData({ ...formData, appointmentDate: date })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">Time</Label>
                        <Input
                            id="time"
                            type="time"
                            value={formData.appointmentTime}
                            onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">Reason</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Booking..." : "Book Appointment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
