"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phone } from "lucide-react"

export function OutboundCallDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [patientName, setPatientName] = useState("")

  const handleMakeCall = async () => {
    if (!phoneNumber || !message) return

    setLoading(true)
    try {
      const response = await fetch("/api/twilio/outbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          patientName: patientName || "Patient",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setOpen(false)
        setPhoneNumber("")
        setMessage("")
        setPatientName("")
        alert(`Call initiated successfully! Call SID: ${data.callSid}`)
      } else {
        const data = await response.json()
        alert(`Failed to make call: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error making call:", error)
      alert("Failed to make call. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Phone className="w-4 h-4 mr-2" />
          Make Call via Twilio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Outbound Call (Twilio)</DialogTitle>
          <DialogDescription>Initiate a real automated AI call using your Twilio phone number</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name (Optional)</Label>
            <Input
              id="patientName"
              type="text"
              placeholder="John Doe"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Initial Message *</Label>
            <Textarea
              id="message"
              placeholder="Hello, this is an automated call from the clinic. How can I help you today?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              The AI will speak this message and then respond to the patient
            </p>
          </div>
          <Button onClick={handleMakeCall} disabled={loading || !phoneNumber || !message} className="w-full">
            {loading ? "Initiating Call..." : "Call Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
