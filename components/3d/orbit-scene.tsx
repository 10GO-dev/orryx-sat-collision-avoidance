"use client"

import { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Earth } from "./earth"
import { OrbitPath } from "./orbit-path"
import { SatelliteMarker } from "./satellite-marker"
import { SatelliteInfoPanel } from "./satellite-info-panel"
import { processSatellitesForOrbit } from "../../utils/orbital"
import type { SatelliteSchema } from "../../types/api"

interface OrbitSceneProps {
  satellites: SatelliteSchema[]
  selectedSatellite: SatelliteSchema | null
  onSatelliteSelect: (satellite: SatelliteSchema | null) => void
  visibleTypes: string[]
  showOrbits: boolean
  showLabels: boolean
}

export function OrbitScene({
  satellites,
  selectedSatellite,
  onSatelliteSelect,
  visibleTypes,
  showOrbits,
  showLabels,
}: OrbitSceneProps) {
  // Filtrar satélites por tipos visibles
  const filteredSatellites = useMemo(() => {
    return satellites.filter((sat) => visibleTypes.includes(sat.object_type))
  }, [satellites, visibleTypes])

  const orbits = useMemo(() => {
    return processSatellitesForOrbit(filteredSatellites.slice(0, 100)) // Aumentamos el límite
  }, [filteredSatellites])

  const getOrbitColor = (objectType: string) => {
    switch (objectType.toLowerCase()) {
      case "payload":
        return "#00ff00"
      case "debris":
        return "#ff4444"
      case "rocket body":
        return "#ffaa00"
      default:
        return "#ffffff"
    }
  }

  const handleSatelliteClick = (noradId: number) => {
    const satellite = satellites.find((sat) => sat.norad_id === noradId)
    if (satellite) {
      onSatelliteSelect(selectedSatellite?.norad_id === noradId ? null : satellite)
    }
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        style={{ background: "#000011" }}
        onPointerMissed={() => onSatelliteSelect(null)}
      >
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Environment */}
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} />

        {/* Earth */}
        <Earth />

        {/* Orbits */}
        {showOrbits &&
          orbits.map((orbit) => (
            <OrbitPath
              key={orbit.noradId}
              points={orbit.points}
              color={getOrbitColor(orbit.objectType)}
              opacity={selectedSatellite?.noradId === orbit.noradId ? 1 : 0.4}
            />
          ))}

        {/* Satellites */}
        {orbits.map((orbit) => (
          <SatelliteMarker
            key={orbit.noradId}
            orbit={orbit}
            selected={selectedSatellite?.norad_id === orbit.noradId}
            showLabel={showLabels}
            onClick={() => handleSatelliteClick(orbit.noradId)}
          />
        ))}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI}
        />
      </Canvas>

      {/* Satellite Info Panel */}
      <SatelliteInfoPanel satellite={selectedSatellite} onClose={() => onSatelliteSelect(null)} />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-xs">
        <h3 className="font-bold mb-2">3D Orbit View</h3>
        <div className="space-y-2 text-sm">
          <div>Objects: {orbits.length}</div>
          <div>Selected: {selectedSatellite ? selectedSatellite.name : "None"}</div>
        </div>

        <div className="mt-4 space-y-1 text-xs">
          <div className="text-muted-foreground mb-2">Object Types:</div>
          {visibleTypes.includes("PAYLOAD") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Payload</span>
            </div>
          )}
          {visibleTypes.includes("DEBRIS") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Debris</span>
            </div>
          )}
          {visibleTypes.includes("ROCKET BODY") && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Rocket Body</span>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>Click on objects to view details</p>
          <p>Click empty space to deselect</p>
        </div>
      </div>
    </div>
  )
}
