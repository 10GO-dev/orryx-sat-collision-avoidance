"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink } from "lucide-react"
import type { SatelliteSchema } from "../types/api"
import { SatellitesTableModal } from "./satellites-table-modal"

interface SatellitesTableProps {
  satellites: SatelliteSchema[]
  loading: boolean
}

export function SatellitesTable({ satellites, loading }: SatellitesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteSchema | null>(null)
  const itemsPerPage = 10

  const filteredSatellites = satellites.filter(
    (sat) => sat.name.toLowerCase().includes(searchTerm.toLowerCase()) || sat.norad_id.toString().includes(searchTerm),
  )

  const totalPages = Math.ceil(filteredSatellites.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSatellites = filteredSatellites.slice(startIndex, startIndex + itemsPerPage)

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Satellites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Satellites ({satellites.length})</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search satellites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedSatellites.map((satellite) => (
              <div key={satellite.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{satellite.name}</h3>
                    <Badge variant={getObjectTypeColor(satellite.object_type)}>{satellite.object_type}</Badge>
                    {satellite.collision_alerts && satellite.collision_alerts.length > 0 && (
                      <Badge variant="destructive">
                        {satellite.collision_alerts.length} Alert{satellite.collision_alerts.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedSatellite(satellite); setModalOpen(true); }}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <strong>NORAD ID:</strong> {satellite.norad_id}
                    </p>
                    <p>
                      <strong>Source:</strong> {satellite.source || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Created:</strong> {new Date(satellite.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Updated:</strong> {new Date(satellite.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>TLE Line 1:</strong> {satellite.tle_line1.substring(0, 30)}...
                    </p>
                    <p>
                      <strong>TLE Line 2:</strong> {satellite.tle_line2.substring(0, 30)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <SatellitesTableModal satellite={selectedSatellite} open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setSelectedSatellite(null); }} />
    </>
  )
}
