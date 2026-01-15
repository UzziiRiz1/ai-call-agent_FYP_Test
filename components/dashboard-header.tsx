"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Phone, User, LayoutDashboard, Calendar, Users, Stethoscope, BarChart3, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  user?: {
    name: string
    email: string
    role: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Call Agent</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
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
      </div>
    </header>
  )
}
