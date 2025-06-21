import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Satellite, AlertTriangle, Trash2, Activity } from "lucide-react"
import type { SummarySchema } from "../types/api"

interface StatsCardsProps {
  summary: SummarySchema | null
  loading: boolean
}

export function StatsCards({ summary, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const data = summary?.data || {}
  if (!data) {
    return <div className="text-center text-muted-foreground py-8">No data available</div>
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Satellites</CardTitle>
          <Satellite className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_satellites || 0}</div>
          <p className="text-xs text-muted-foreground">Active objects in orbit</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collision Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{data.collision_alerts || 0}</div>
          <p className="text-xs text-muted-foreground">Critical alerts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Space Debris</CardTitle>
          <Trash2 className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{data.total_debris || 0}</div>
          <p className="text-xs text-muted-foreground">Tracked debris objects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CDM Messages</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{data.total_cdm || 0}</div>
          <p className="text-xs text-muted-foreground">Conjunction messages</p>
        </CardContent>
      </Card>
    </div>
  )
}
