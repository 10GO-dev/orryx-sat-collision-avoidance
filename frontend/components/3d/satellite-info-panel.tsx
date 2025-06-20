"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Satellite, AlertTriangle } from "lucide-react"
import { getOrbitalInfo } from "../../utils/orbital"
import type { SatelliteSchema } from "../../types/api"

interface SatelliteInfoPanelProps {
  satellite: SatelliteSchema | null
  onClose: () => void
}

export function SatelliteInfoPanel({ satellite, onClose }: SatelliteInfoPanelProps) {
  if (!satellite) return null

  const orbitalInfo = getOrbitalInfo(satellite.tle_line1, satellite.tle_line2)

  const getObjectTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "payload":
        return "default"
      case "debris":
        return "destructive"
      case "rocket body":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="absolute top-4 right-4 w-80 z-10">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Satellite className="h-5 w-5" />
              Satellite Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-base truncate" title={satellite.name}>
                {satellite.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getObjectTypeColor(satellite.object_type)}>{satellite.object_type}</Badge>
                {satellite.collision_alerts && satellite.collision_alerts.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {satellite.collision_alerts.length} Alert{satellite.collision_alerts.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">NORAD ID</p>
              <p className="font-mono font-medium">{satellite.norad_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium">{satellite.source || "N/A"}</p>
            </div>
          </div>

          {/* Orbital Parameters */}
          {orbitalInfo && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Orbital Parameters</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Inclination</p>
                  <p className="font-mono">{orbitalInfo.inclination}°</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Altitude</p>
                  <p className="font-mono">{orbitalInfo.altitude} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Period</p>
                  <p className="font-mono">{orbitalInfo.period} min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Eccentricity</p>
                  <p className="font-mono">{orbitalInfo.eccentricity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RAAN</p>
                  <p className="font-mono">{orbitalInfo.raan}°</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Arg. Perigee</p>
                  <p className="font-mono">{orbitalInfo.argOfPerigee}°</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>{new Date(satellite.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p>{new Date(satellite.updated_at).toLocaleString()}</p>
            </div>
          </div>

          {/* TLE Data */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">TLE Data</h4>
            <div className="bg-muted p-2 rounded text-xs font-mono">
              <div className="break-all">{satellite.tle_line1}</div>
              <div className="break-all">{satellite.tle_line2}</div>
            </div>
          </div>

          {/* Collision Alerts */}
          {satellite.collision_alerts && satellite.collision_alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-600">Active Alerts</h4>
              <div className="space-y-2">
                {satellite.collision_alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="bg-red-50 border border-red-200 p-2 rounded text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {alert.risk_level || "Unknown"}
                      </Badge>
                      <span className="text-muted-foreground">{new Date(alert.tca).toLocaleDateString()}</span>
                    </div>
                    <p className="text-red-800">vs {alert.sat_2_name}</p>
                    {alert.min_rng && <p className="text-red-700">Min Range: {alert.min_rng.toFixed(2)} km</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
