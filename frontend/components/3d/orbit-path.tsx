"use client"

import { useMemo, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame, extend } from "@react-three/fiber"
import type { OrbitPoint } from "../../utils/orbital"

interface OrbitPathProps {
  points: OrbitPoint[]
  color: string
  opacity?: number
  progress?: number // valor entre 0 y 1 que indica la posición actual del objeto en la órbita
}

export function OrbitPath({ points, color, opacity = 0.8, progress = 0 }: OrbitPathProps) {
  const lineRef = useRef<THREE.Line>(null)
  const segmentLength = Math.max(6, Math.floor(points.length * 0.08)) // segmento visible

  // Calcular el segmento de la órbita alrededor de la posición actual, suavizado y cerrado
  const segmentPoints = (() => {
    if (points.length < 2) return []
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x, p.y, p.z)), true)
    const idx = Math.floor(progress * points.length)
    const total = points.length
    const seg: THREE.Vector3[] = []
    const window = Math.max(6, Math.floor(points.length * 0.08))
    for (let i = -Math.floor(window / 2); i <= Math.floor(window / 2); i++) {
      const t = ((idx + i + total) % total) / total
      seg.push(curve.getPointAt(t))
    }
    return seg
  })()

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(segmentPoints)
  }, [progress, points])

  return (
    <primitive
      object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth: 2 }))}
      ref={lineRef}
    />
  )
}
