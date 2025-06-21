"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Scan, Satellite } from "lucide-react"
import { useApi, triggerCollisionScan } from "../hooks/useApi"
import { StatsCards } from "../components/stats-cards"
import { CollisionAlerts } from "../components/collision-alerts"
import { SatelliteStats } from "../components/satellite-stats"
import { SatellitesTable } from "../components/satellites-table"
import type {
  SummarySchema,
  SatelliteStatsSchema,
  ApiResponse,
  CollisionAlertSchema,
  SatelliteSchema,
} from "../types/api"
import { OrbitVisualization } from "../components/orbit-visualization"

export default function Dashboard() {
  const [scanLoading, setScanLoading] = useState(false)
  const [scanMessage, setScanMessage] = useState<string>("")

  // API calls
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi<SummarySchema>("/api/summary")
  const {
    data: satelliteStats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApi<SatelliteStatsSchema>("/api/satellites/stats")
  const {
    data: collisionAlerts,
    loading: alertsLoading,
    refetch: refetchAlerts,
  } = useApi<ApiResponse<CollisionAlertSchema[]>>("/api/collision-alerts")
  const {
    data: satellites,
    loading: satellitesLoading,
    refetch: refetchSatellites,
  } = useApi<ApiResponse<SatelliteSchema[]>>("/api/satellites")
  const { data: topCollisions, loading: topCollisionsLoading } = useApi<any>("/api/top-collision")

  const handleCollisionScan = async () => {
    try {
      setScanLoading(true)
      const result = await triggerCollisionScan()
      setScanMessage(result.message)
      // Refresh data after scan
      setTimeout(() => {
        refetchSummary()
        refetchAlerts()
        refetchStats()
      }, 2000)
    } catch (error) {
      setScanMessage("Error triggering collision scan")
    } finally {
      setScanLoading(false)
    }
  }

  const refreshAll = () => {
    refetchSummary()
    refetchStats()
    refetchAlerts()
    refetchSatellites()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Orryx Space Situational Awareness</h1>
                <p className="text-muted-foreground">Advanced Satellite Tracking & Collision Detection System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refreshAll} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={handleCollisionScan} disabled={scanLoading} size="sm">
                <Scan className="h-4 w-4 mr-1" />
                {scanLoading ? "Scanning..." : "Trigger Scan"}
              </Button>
            </div>
          </div>
          {scanMessage && <div className="mt-2 p-2 bg-muted rounded text-sm">{scanMessage}</div>}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="mb-6">
          <StatsCards summary={summary} loading={summaryLoading} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="satellites">Satellites</TabsTrigger>
            <TabsTrigger value="alerts">Collision Alerts</TabsTrigger>
            <TabsTrigger value="orbits">3D Orbits</TabsTrigger>
            <TabsTrigger value="debris">Debris</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <CollisionAlerts alerts={collisionAlerts?.data || []} loading={alertsLoading} />
              <SatelliteStats stats={satelliteStats} loading={statsLoading} />
            </div>

            {/* Top Collisions */}
            <Card>
              <CardHeader>
                <CardTitle>Top Collision Risks</CardTitle>
              </CardHeader>
              <CardContent>
                {topCollisionsLoading ? (
                  <div className="h-32 bg-muted animate-pulse rounded"></div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Top collision data will be displayed here</p>
                    <p className="text-sm">Data structure: {JSON.stringify(topCollisions, null, 2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satellites">
            <SatellitesTable satellites={satellites?.data || []} loading={satellitesLoading} />
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              <CollisionAlerts alerts={collisionAlerts?.data || []} loading={alertsLoading} />
              {/* Additional alert details can go here */}
            </div>
          </TabsContent>

          <TabsContent value="debris">
            <Card>
              <CardHeader>
                <CardTitle>Space Debris Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Debris tracking interface will be implemented here using the /api/debris endpoints
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orbits">
            <OrbitVisualization satellites={satellites?.data || []} loading={satellitesLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
