"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Eye, EyeOff, RotateCcw, Filter } from "lucide-react"
import { OrbitScene } from "./3d/orbit-scene"
import type { SatelliteSchema } from "../types/api"

interface OrbitVisualizationProps {
  satellites: SatelliteSchema[]
  loading: boolean
}

const OBJECT_TYPES = ["PAYLOAD", "DEBRIS", "ROCKET BODY", "UNKNOWN"]

export function OrbitVisualization({ satellites, loading }: OrbitVisualizationProps) {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteSchema | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [visibleTypes, setVisibleTypes] = useState<string[]>(OBJECT_TYPES)

  // Obtener tipos de objetos únicos de los datos
  const availableTypes = useMemo(() => {
    const types = [...new Set(satellites.map((sat) => sat.object_type))]
    return types.sort()
  }, [satellites])

  const filteredSatellites = satellites.filter(
    (sat) =>
      visibleTypes.includes(sat.object_type) &&
      (sat.name.toLowerCase().includes(searchTerm.toLowerCase()) || sat.norad_id.toString().includes(searchTerm)),
  )

  const handleTypeToggle = (type: string) => {
    setVisibleTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleSelectAll = () => {
    setVisibleTypes(availableTypes)
  }

  const handleSelectNone = () => {
    setVisibleTypes([])
  }

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

  const getTypeStats = () => {
    return availableTypes.map((type) => ({
      type,
      count: satellites.filter((sat) => sat.object_type === type).length,
      visible: visibleTypes.includes(type),
    }))
  }

  if (loading) {
    return (
      <Card className="h-[800px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading orbital data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[800px]">
      {/* Sidebar */}
      {showSidebar && (
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Controls
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  <EyeOff className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search satellites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Display Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={showOrbits} onCheckedChange={setShowOrbits} />
                    Show Orbit Paths
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={showLabels} onCheckedChange={setShowLabels} />
                    Show All Labels
                  </label>
                </div>
              </div>

              {/* Object Type Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Object Types
                  </h4>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs h-6 px-2">
                      All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSelectNone} className="text-xs h-6 px-2">
                      None
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {getTypeStats().map(({ type, count, visible }) => (
                    <div key={type} className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={visible} onCheckedChange={() => handleTypeToggle(type)} />
                        <Badge variant={getObjectTypeColor(type)} className="text-xs">
                          {type}
                        </Badge>
                      </label>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-semibold text-sm">Statistics</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Objects:</span>
                    <span>{satellites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visible:</span>
                    <span>{filteredSatellites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected:</span>
                    <span>{selectedSatellite ? selectedSatellite.name : "None"}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSatellite(null)}
                  disabled={!selectedSatellite}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3D Visualization */}
      <div className={showSidebar ? "col-span-9" : "col-span-12"}>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>3D Orbital Visualization</span>
              <div className="flex gap-2">
                {!showSidebar && (
                  <Button variant="outline" size="sm" onClick={() => setShowSidebar(true)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Show Controls
                  </Button>
                )}
                <Badge variant="outline">
                  {filteredSatellites.length} / {satellites.length} Objects
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <OrbitScene
              satellites={satellites}
              selectedSatellite={selectedSatellite}
              onSatelliteSelect={setSelectedSatellite}
              visibleTypes={visibleTypes}
              showOrbits={showOrbits}
              showLabels={showLabels}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
