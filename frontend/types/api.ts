export interface SatelliteSchema {
  id: number
  norad_id: number
  name: string
  tle_line1: string
  tle_line2: string
  object_type: string
  source: string | null
  created_at: string
  updated_at: string
  collision_alerts?: CollisionAlertSchema[] | null
}

export interface CollisionAlertSchema {
  id: number
  cdm_id: string | null
  created: string
  tca: string
  min_rng: number | null
  pc: number | null
  sat_1_id: string
  sat_1_name: string
  sat_2_id: string
  sat_2_name: string
  risk_level: string | null
  alert_reason: string | null
}

export interface CDMSchema {
  id: string
  created: string
  emergency_reportable: string
  tca: string
  min_rng: number | null
  pc: number | null
  sat_1_id: string
  sat_1_name: string
  sat1_object_type: string | null
  sat1_rcs: string | null
  sat_1_excl_vol: number | null
  sat_2_id: string
  sat_2_name: string
  sat2_object_type: string | null
  sat2_rcs: string | null
  sat_2_excl_vol: number | null
}

export interface SummarySchema {
  status: string
  data: Record<string, number | string | null>
}

export interface SatelliteStatsSchema {
  status: string
  data: Record<string, number>
}

export interface ApiResponse<T> {
  status: string
  data: T
  count?: number
}
