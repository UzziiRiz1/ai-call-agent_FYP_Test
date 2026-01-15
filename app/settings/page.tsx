"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Server, Shield, Bell, Phone } from "lucide-react"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState({
        clinicName: "AI Medical Center",
        timezone: "UTC",
        officeHours: {
            start: "09:00",
            end: "17:00"
        },
        aiVoice: "alloy",
        systemPrompt: "You are a helpful medical receptionist...",
        enableEmergencyDetection: true,
        emergencyContact: "+1234567890",
        notificationsEmail: "admin@clinic.com"
    })

    useEffect(() => {
        // Fetch settings
        setLoading(true)
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.config) {
                    setConfig(data.config)
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))

        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user)
            })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            })
            if (res.ok) {
                alert("Settings saved successfully!")
            } else {
                alert("Failed to save settings")
            }
        } catch (error) {
            console.error(error)
            alert("Error saving settings")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={user} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                        <p className="text-muted-foreground">Configure AI agent behavior and system preferences</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 space-y-4">
                                <h2 className="text-xl font-bold mb-4">Clinic Information</h2>
                                <div className="space-y-2">
                                    <Label>Clinic Name</Label>
                                    <Input
                                        value={config.clinicName}
                                        onChange={(e) => setConfig({ ...config, clinicName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Select value={config.timezone} onValueChange={(v) => setConfig({ ...config, timezone: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC (Universal Coordinated Time)</SelectItem>
                                            <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                                            <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Card>

                            <Card className="p-6 space-y-4">
                                <h2 className="text-xl font-bold mb-4">Office Hours</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Open From</Label>
                                        <Input
                                            type="time"
                                            value={config.officeHours.start}
                                            onChange={(e) => setConfig({ ...config, officeHours: { ...config.officeHours, start: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Close At</Label>
                                        <Input
                                            type="time"
                                            value={config.officeHours.end}
                                            onChange={(e) => setConfig({ ...config, officeHours: { ...config.officeHours, end: e.target.value } })}
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Calls outside these hours will be handled by the after-hours AI protocol.</p>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="ai">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Server className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold">AI Model Configuration</h2>
                            </div>

                            <div className="space-y-2">
                                <Label>Voice Identity</Label>
                                <Select value={config.aiVoice} onValueChange={(v) => setConfig({ ...config, aiVoice: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                                        <SelectItem value="echo">Echo (Male)</SelectItem>
                                        <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>System Prompt</Label>
                                <Textarea
                                    value={config.systemPrompt}
                                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                                    className="min-h-[150px] font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">This prompt defines the core personality and rules for the AI agent.</p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Emergency Detection</Label>
                                    <p className="text-sm text-muted-foreground">Automatically scan calls for emergency keywords</p>
                                </div>
                                <Switch
                                    checked={config.enableEmergencyDetection}
                                    onCheckedChange={(c: boolean) => setConfig({ ...config, enableEmergencyDetection: c })}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Bell className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold">Alert Configuration</h2>
                            </div>

                            <div className="space-y-2">
                                <Label>Emergency Contact Number</Label>
                                <div className="flex gap-2">
                                    <Phone className="h-4 w-4 mt-2.5 text-muted-foreground" />
                                    <Input
                                        value={config.emergencyContact}
                                        onChange={(e) => setConfig({ ...config, emergencyContact: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Admin Notification Email</Label>
                                <Input
                                    type="email"
                                    value={config.notificationsEmail}
                                    onChange={(e) => setConfig({ ...config, notificationsEmail: e.target.value })}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Shield className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold">Security & Access</h2>
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                API Keys and sensitive credentials are managed via environment variables and cannot be viewed here.
                            </div>
                            <Button variant="outline">Rotate Webhook Secrets</Button>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
