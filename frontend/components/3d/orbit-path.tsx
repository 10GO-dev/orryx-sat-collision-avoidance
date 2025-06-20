"use client"

import { useMemo } from "react"
import * as THREE from "three"
import type { OrbitPoint } from "../../utils/orbital"

interface OrbitPathProps {
  points: OrbitPoint[]
  color: string
  opacity?: number
}

export function OrbitPath({ points, color, opacity = 0.8 }: OrbitPathProps) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(point.x, point.y, point.z)),
      true, // closed curve
    )

    return new THREE.TubeGeometry(curve, points.length, 0.02, 8, true)
  }, [points])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}
