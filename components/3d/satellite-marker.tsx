"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type * as THREE from "three"
import type { SatelliteOrbit } from "../../utils/orbital"

interface SatelliteMarkerProps {
  orbit: SatelliteOrbit
  selected?: boolean
  onClick?: () => void
  showLabel?: boolean
}

export function SatelliteMarker({ orbit, selected = false, onClick, showLabel = false }: SatelliteMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { currentPosition, name, objectType } = orbit

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsación suave para satélites seleccionados
      if (selected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  const getColor = () => {
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

  const getSize = () => {
    const baseSize = selected ? 0.15 : 0.08
    switch (objectType.toLowerCase()) {
      case "payload":
        return baseSize * 1.2
      case "debris":
        return baseSize * 0.8
      case "rocket body":
        return baseSize
      default:
        return baseSize
    }
  }

  return (
    <group position={[currentPosition.x, currentPosition.y, currentPosition.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto"
        }}
      >
        <sphereGeometry args={[getSize(), 12, 8]} />
        <meshBasicMaterial
          color={getColor()}
          transparent
          opacity={selected ? 1 : 0.8}
          emissive={selected ? getColor() : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
        />
      </mesh>

      {/* Glow effect for selected satellites */}
      {selected && (
        <mesh>
          <sphereGeometry args={[getSize() * 2, 12, 8]} />
          <meshBasicMaterial color={getColor()} transparent opacity={0.1} />
        </mesh>
      )}

      {/* Label for selected or when showLabel is true */}
      {(selected || showLabel) && (
        <Html position={[0, getSize() + 0.3, 0]} center distanceFactor={8} occlude>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}
