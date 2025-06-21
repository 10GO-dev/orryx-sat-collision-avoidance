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
export function calculateOrbit(tleLine1: string, tleLine2: string, steps = 300): OrbitPoint[] {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
    const points: OrbitPoint[] = []

    // Calcular periodo real usando meanMotion
    const meanMotion = satrec.no * (60 * 24) / (2 * Math.PI) // revs/día
    const periodMinutes = 1440 / meanMotion // minutos
    const periodMs = periodMinutes * 60 * 1000

    // Calcular semieje mayor real (a) en km
    const mu = 398600.4418 // km^3/s^2
    const n = satrec.no // rad/min
    const a = Math.pow(mu / (n * n), 1 / 3) // km
    // Escala: radio de la Tierra en Three.js debe ser 6.371
    const scale = 6.371 / 6371 // 6371 km = radio real Tierra
    // Pero los puntos deben estar en la escala de a respecto a la Tierra
    // Así que ajustamos la escala para que a km -> a * scale en la escena

    const now = new Date()
    for (let i = 0; i < steps; i++) {
      const time = new Date(now.getTime() + (i * periodMs) / steps)
      const positionAndVelocity = satellite.propagate(satrec, time)
      if (
        positionAndVelocity &&
        positionAndVelocity.position &&
        typeof positionAndVelocity.position !== "boolean"
      ) {
        // Escala usando el radio real de la Tierra
        const [x, y, z] = [
          positionAndVelocity.position.x * scale,
          positionAndVelocity.position.z * scale,
          -positionAndVelocity.position.y * scale,
        ]
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
    if (
      positionAndVelocity &&
      positionAndVelocity.position &&
      typeof positionAndVelocity.position !== "boolean"
    ) {
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
    // Parámetros orbitales calculados por satellite.js
    const inclination = satrec.inclo * (180 / Math.PI) // radianes a grados
    const raan = satrec.nodeo * (180 / Math.PI)
    const eccentricity = satrec.ecco
    const argOfPerigee = satrec.argpo * (180 / Math.PI)
    const meanAnomaly = satrec.mo * (180 / Math.PI)
    const meanMotion = satrec.no * (60 * 24) / (2 * Math.PI) // revs/día

    // Constantes
    const mu = 398600.4418 // km^3/s^2, constante gravitacional estándar de la Tierra
    const n = satrec.no // rad/min
    const a = Math.pow(mu / (n * n * (Math.PI / 180) * (Math.PI / 180)), 1 / 3) // km
    const period = (2 * Math.PI) / (n * (Math.PI / 180)) / 60 // minutos
    const altitude = a - 6371 // km sobre la superficie

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
