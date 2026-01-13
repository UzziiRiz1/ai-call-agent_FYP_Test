import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  colorClass?: string
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, colorClass = "bg-primary/10" }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && <p className={`text-sm mt-2 ${trendUp ? "text-green-600" : "text-muted-foreground"}`}>{trend}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}
