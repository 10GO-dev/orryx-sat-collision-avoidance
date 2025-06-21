import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"
import type { CollisionAlertSchema } from "../types/api"

interface CollisionAlertsProps {
  alerts: CollisionAlertSchema[]
  loading: boolean
}

export function CollisionAlerts({ alerts, loading }: CollisionAlertsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Collision Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Critical Collision Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No critical alerts at this time</p>
          ) : (
            alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(alert.risk_level)}>{alert.risk_level || "Unknown"}</Badge>
                    <span className="text-sm font-medium">Alert #{alert.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(alert.tca).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm">
                  <p>
                    <strong>Objects:</strong> {alert.sat_1_name} ↔ {alert.sat_2_name}
                  </p>
                  <p>
                    <strong>Min Range:</strong> {alert.min_rng ? `${alert.min_rng.toFixed(2)} km` : "N/A"}
                  </p>
                  <p>
                    <strong>Collision Probability:</strong> {alert.pc ? `${(alert.pc * 100).toFixed(6)}%` : "N/A"}
                  </p>
                  {alert.alert_reason && (
                    <p>
                      <strong>Reason:</strong> {alert.alert_reason}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
