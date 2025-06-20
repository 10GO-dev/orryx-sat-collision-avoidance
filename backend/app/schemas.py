from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class CollisionAlertSchema(BaseModel):
    id: int
    cdm_id: Optional[str]
    created: datetime
    tca: datetime
    min_rng: Optional[float]
    pc: Optional[float]
    sat_1_id: str
    sat_1_name: str
    sat_2_id: str
    sat_2_name: str
    risk_level: Optional[str]
    alert_reason: Optional[str]

class SatelliteSchema(BaseModel):
    id: int
    norad_id: int
    name: str
    tle_line1: str
    tle_line2: str
    object_type: str
    source: Optional[str]
    created_at: datetime
    updated_at: datetime
    collision_alerts: Optional[List[CollisionAlertSchema]] = None

class SatelliteListSchema(BaseModel):
    status: str
    data: List[SatelliteSchema]
    count: int

class SatelliteDetailSchema(BaseModel):
    status: str
    data: SatelliteSchema

class SatelliteStatsDataSchema(BaseModel):
    total: int
    by_type: Dict[str, int]

class SatelliteStatsSchema(BaseModel):
    status: str
    data: SatelliteStatsDataSchema

class DebrisStatsSchema(BaseModel):
    status: str
    data: Dict[str, int]

class CDMSchema(BaseModel):
    id: str
    created: datetime
    emergency_reportable: str
    tca: datetime
    min_rng: Optional[float]
    pc: Optional[float]
    sat_1_id: str
    sat_1_name: str
    sat1_object_type: Optional[str]
    sat1_rcs: Optional[str]
    sat_1_excl_vol: Optional[float]
    sat_2_id: str
    sat_2_name: str
    sat2_object_type: Optional[str]
    sat2_rcs: Optional[str]
    sat_2_excl_vol: Optional[float]

class CDMListSchema(BaseModel):
    status: str
    data: List[CDMSchema]
    count: int

class CollisionAlertListSchema(BaseModel):
    status: str
    data: List[CollisionAlertSchema]
    count: int

class SummarySchema(BaseModel):
    status: str
    data: Dict[str, int | str | None]

class MessageSchema(BaseModel):
    message: str
