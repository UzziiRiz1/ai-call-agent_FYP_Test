"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Phone, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DashboardHeaderProps {
  user?: {
    name: string
    email: string
    role: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Phone className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">AI Call Agent</h1>
            <p className="text-xs text-muted-foreground">Real-time Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
            <LogOut className="h-4 w-4 mr-2" />
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  )
}
