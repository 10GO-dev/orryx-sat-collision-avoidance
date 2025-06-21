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

export interface OrbitSceneProps {
  satellites: SatelliteSchema[]
  selectedSatellite: SatelliteSchema | null
  onSatelliteSelect: (satellite: SatelliteSchema | null) => void
  showOrbits: boolean
  showLabels: boolean
  speed: number
}

export function OrbitScene({
  satellites,
  selectedSatellite,
  onSatelliteSelect,
  showOrbits,
  showLabels,
  speed,
}: OrbitSceneProps) {
  // Solo renderiza los objetos recibidos por props, sin controles ni filtros internos
  const orbits = useMemo(() => processSatellitesForOrbit(satellites), [satellites])

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
          orbits.map((orbit) => {
            const elapsed = performance.now() / 1000
            const progress = ((elapsed * speed) % 1)
            return (
              <OrbitPath
                key={orbit.noradId}
                points={orbit.points}
                color={getOrbitColor(orbit.objectType)}
                opacity={selectedSatellite?.norad_id === orbit.noradId ? 1 : 0.4}
                progress={progress}
              />
            )
          })}

        {/* Satellites */}
        {orbits.map((orbit) => (
          <SatelliteMarker
            key={orbit.noradId}
            orbit={orbit}
            selected={selectedSatellite?.norad_id === orbit.noradId}
            showLabel={showLabels}
            onClick={() => handleSatelliteClick(orbit.noradId)}
            speed={speed}
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
    </div>
  )
}
