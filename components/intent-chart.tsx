"use client"

import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface IntentChartProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export function IntentChart({ data }: IntentChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Intent Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
