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
        }),
      })

      if (response.ok) {
        setOpen(false)
        setPhoneNumber("")
        setMessage("")
        alert("Call initiated successfully!")
      } else {
        const data = await response.json()
        alert(`Failed to make call: ${data.error}`)
      }
    } catch (error) {
      console.error("Error making call:", error)
      alert("Failed to make call")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Phone className="w-4 h-4 mr-2" />
          Make Outbound Call
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Outbound Call</DialogTitle>
          <DialogDescription>Initiate an automated call to a patient or contact</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter the message to be spoken during the call..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleMakeCall} disabled={loading || !phoneNumber || !message} className="w-full">
            {loading ? "Calling..." : "Make Call"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
