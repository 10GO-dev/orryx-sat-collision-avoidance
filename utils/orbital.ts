import * as satellite from "satellite.js"

export interface OrbitPoint {
  x: number
  y: number
  z: number
  timestamp: number
}

export interface SatelliteOrbit {
  noradId: number
  name: string
  objectType: string
  points: OrbitPoint[]
  currentPosition: OrbitPoint
}

// Convierte coordenadas ECI a coordenadas para Three.js (escaladas)
function eciToThreeJS(eciCoords: satellite.EciVec3<number>, scale = 0.001): [number, number, number] {
  return [
    eciCoords.x * scale,
    eciCoords.z * scale, // Y y Z intercambiados para Three.js
    -eciCoords.y * scale,
  ]
}

// Calcula la órbita completa de un satélite
export function calculateOrbit(tleLine1: string, tleLine2: string, steps = 100): OrbitPoint[] {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
    const points: OrbitPoint[] = []

    // Calcular puntos de órbita para las próximas 24 horas
    const now = new Date()
    const period = 90 * 60 * 1000 // Aproximadamente 90 minutos en ms

    for (let i = 0; i < steps; i++) {
      const time = new Date(now.getTime() + (i * period * 24) / steps)
      const positionAndVelocity = satellite.propagate(satrec, time)

      if (positionAndVelocity.position && typeof positionAndVelocity.position !== "boolean") {
        const [x, y, z] = eciToThreeJS(positionAndVelocity.position)
        points.push({
          x,
          y,
          z,
          timestamp: time.getTime(),
        })
      }
    }

    return points
  } catch (error) {
    console.error("Error calculating orbit:", error)
    return []
  }
}

// Calcula la posición actual de un satélite
export function getCurrentPosition(tleLine1: string, tleLine2: string): OrbitPoint | null {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
    const now = new Date()
    const positionAndVelocity = satellite.propagate(satrec, now)

    if (positionAndVelocity.position && typeof positionAndVelocity.position !== "boolean") {
      const [x, y, z] = eciToThreeJS(positionAndVelocity.position)
      return {
        x,
        y,
        z,
        timestamp: now.getTime(),
      }
    }

    return null
  } catch (error) {
    console.error("Error calculating current position:", error)
    return null
  }
}

// Procesa múltiples satélites para crear órbitas
export function processSatellitesForOrbit(satellites: any[]): SatelliteOrbit[] {
  return satellites
    .map((sat) => {
      const points = calculateOrbit(sat.tle_line1, sat.tle_line2)
      const currentPosition = getCurrentPosition(sat.tle_line1, sat.tle_line2)

      return {
        noradId: sat.norad_id,
        name: sat.name,
        objectType: sat.object_type,
        points,
        currentPosition: currentPosition || { x: 0, y: 0, z: 0, timestamp: Date.now() },
      }
    })
    .filter((orbit) => orbit.points.length > 0)
}

// Obtiene información orbital detallada de un satélite
export function getOrbitalInfo(tleLine1: string, tleLine2: string) {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2)

    // Extraer información orbital de las líneas TLE
    const inclination = Number.parseFloat(tleLine2.substring(8, 16))
    const raan = Number.parseFloat(tleLine2.substring(17, 25)) // Right Ascension of Ascending Node
    const eccentricity = Number.parseFloat("0." + tleLine2.substring(26, 33))
    const argOfPerigee = Number.parseFloat(tleLine2.substring(34, 42))
    const meanAnomaly = Number.parseFloat(tleLine2.substring(43, 51))
    const meanMotion = Number.parseFloat(tleLine2.substring(52, 63))

    // Calcular período orbital
    const period = 1440 / meanMotion // en minutos

    // Calcular altitud aproximada (fórmula simplificada)
    const semiMajorAxis = Math.pow((1440 / (meanMotion * 2 * Math.PI)) * Math.sqrt(398600.4418), 2 / 3)
    const altitude = semiMajorAxis - 6371 // km sobre la superficie

    return {
      inclination: inclination.toFixed(2),
      raan: raan.toFixed(2),
      eccentricity: eccentricity.toFixed(6),
      argOfPerigee: argOfPerigee.toFixed(2),
      meanAnomaly: meanAnomaly.toFixed(2),
      meanMotion: meanMotion.toFixed(8),
      period: period.toFixed(2),
      altitude: altitude.toFixed(2),
    }
  } catch (error) {
    console.error("Error getting orbital info:", error)
    return null
  }
}
