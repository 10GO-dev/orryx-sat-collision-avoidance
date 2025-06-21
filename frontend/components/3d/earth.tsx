"use client"

import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import type * as THREE from "three"

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Usar texturas básicas para la Tierra
  const earthTexture = useLoader(TextureLoader, "/assets/3d/texture_earth.jpg")

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6.371, 64, 32]} />
      <meshStandardMaterial 
        map={earthTexture} 
        roughness={0.3} // Menos rugoso
        metalness={0.4} // Más reflectante
        emissive={0x222222} // Ligeramente autoiluminado
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}
