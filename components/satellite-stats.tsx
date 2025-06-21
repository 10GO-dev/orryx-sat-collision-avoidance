import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { SatelliteStatsSchema } from "../types/api"

interface SatelliteStatsProps {
  stats: SatelliteStatsSchema | null
  loading: boolean
}

// Colores personalizados por tipo
const TYPE_COLORS: Record<string, string> = {
  debris: "#FF0000", // rojo
  payload: "#00C49F", // verde
  "rocket body": "#FFBB28", // amarillo
}
const DEFAULT_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

function getTypeColor(type: string, index: number) {
  const key = type.toLowerCase()
  return TYPE_COLORS[key] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}

export function SatelliteStats({ stats, loading }: SatelliteStatsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Satellite Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!stats?.data || !stats.data.by_type) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Satellite Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = Object.entries(stats.data.by_type).map(([name, value]) => ({
    name,
    value,
  }))

  const total = stats.data.total || chartData.reduce((sum, { value }) => sum + value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Satellite Distribution by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTypeColor(entry.name, index)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.data.by_type).map(([type, count], index) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{type}</span>
                  <span>
                    {count} ({((count / total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={(count / total) * 100}
                  className="h-2"
                  style={
                    {
                      "--progress-background": getTypeColor(type, index),
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
