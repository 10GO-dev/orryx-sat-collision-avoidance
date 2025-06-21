"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { SatelliteOrbit } from "../../utils/orbital"

interface SatelliteMarkerProps {
  orbit: SatelliteOrbit
  selected?: boolean
  onClick?: () => void
  showLabel?: boolean
  speed?: number // velocidad de animación
}

export function SatelliteMarker({ orbit, selected = false, onClick, showLabel = false, speed = 0.003 }: SatelliteMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { points, name, objectType } = orbit

  // Depuración: mostrar tipo y posición en cada render
  console.log("SatelliteMarker:", { objectType, name, pointsLength: points.length })

  // Calcular la posición animada a lo largo de la órbita (fluido)
  const orbitCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, p.y, p.z)), true)
  }, [points])

  useFrame((state) => {
    if (meshRef.current && points.length > 0) {
      // Avanza a lo largo de la órbita según el tiempo global
      const t = (state.clock.getElapsedTime() * speed) % 1 // velocidad controlada
      const pos = orbitCurve.getPointAt(t)
      meshRef.current.position.set(pos.x, pos.y, pos.z)
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
    // Tamaño base reducido
    const baseSize = selected ? 0.13 : 0.08
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
    <group /* la posición ahora la maneja el mesh */>
      {/* Geometría según tipo de objeto */}
      {(() => {
        const color = getColor()
        const size = getSize()
        if (objectType.toLowerCase() === "payload") {
          // Satélite: cubo
          return (
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
              <boxGeometry args={[size, size, size * 1.5]} />
              <meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.2 : 0} transparent opacity={selected ? 1 : 0.8} />
            </mesh>
          )
        } else if (objectType.toLowerCase() === "debris") {
          // Debris: icosaedro
          return (
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
              <icosahedronGeometry args={[size, 0]} />
              <meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.2 : 0} transparent opacity={selected ? 1 : 0.8} />
            </mesh>
          )
        } else if (objectType.toLowerCase() === "rocket body") {
          // Rocket body: cilindro
          return (
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
              <cylinderGeometry args={[size * 0.4, size * 0.4, size * 2, 16]} />
              <meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.2 : 0} transparent opacity={selected ? 1 : 0.8} />
            </mesh>
          )
        } else {
          // Por defecto: esfera
          return (
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
              <sphereGeometry args={[size, 12, 8]} />
              <meshStandardMaterial color={color} emissive={selected ? color : "#000000"} emissiveIntensity={selected ? 0.2 : 0} transparent opacity={selected ? 1 : 0.8} />
            </mesh>
          )
        }
      })()}

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
