# app/models.py
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, UniqueConstraint

from app.database import Base


class Satellite(Base):
    __tablename__ = "satellites"
    id = Column(Integer, primary_key=True, index=True)
    norad_id = Column(Integer, unique=True, index=True)
    name = Column(String, index=True)
    tle_line1 = Column(String)
    tle_line2 = Column(String)
    object_type = Column(String, nullable=True)  # e.g., 'PAYLOAD', 'DEBRIS', 'ROCKET BODY'
    source = Column(String, nullable=True)  # Optional: to track data source
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    __table_args__ = (UniqueConstraint("norad_id", name="uq_norad_id"),)


class CollisionAlert(Base):
    __tablename__ = "collision_alerts"
    id = Column(Integer, primary_key=True, index=True)
    cdm_id = Column(String, index=True)  # Relación con CDM
    created = Column(DateTime, nullable=False)
    tca = Column(DateTime, nullable=False)
    min_rng = Column(Float, nullable=True)
    pc = Column(Float, nullable=True)
    sat_1_id = Column(String, nullable=False)
    sat_1_name = Column(String, nullable=False)
    sat_2_id = Column(String, nullable=False)
    sat_2_name = Column(String, nullable=False)
    risk_level = Column(String, nullable=True)  # Ej: 'HIGH', 'MEDIUM', 'LOW'
    alert_reason = Column(String, nullable=True)  # Texto opcional


class TLEMetadata(Base):
    __tablename__ = "tle_metadata"
    id = Column(Integer, primary_key=True, index=True)
    last_fetched_at = Column(DateTime, default=datetime.now)


class CDM(Base):
    __tablename__ = "cdm"
    id = Column(String, primary_key=True, index=True)  # CDM_ID as string
    created = Column(DateTime, nullable=False)
    emergency_reportable = Column(String(1), nullable=False)  # 'Y' or 'N'
    tca = Column(DateTime, nullable=False)  # Time of Closest Approach
    min_rng = Column(Float, nullable=True)  # Minimum Range (km)
    pc = Column(Float, nullable=True)  # Probability of Collision
    sat_1_id = Column(String, nullable=False)
    sat_1_name = Column(String, nullable=False)
    sat1_object_type = Column(String, nullable=True)
    sat1_rcs = Column(String, nullable=True)
    sat_1_excl_vol = Column(Float, nullable=True)
    sat_2_id = Column(String, nullable=False)
    sat_2_name = Column(String, nullable=False)
    sat2_object_type = Column(String, nullable=True)
    sat2_rcs = Column(String, nullable=True)
    sat_2_excl_vol = Column(Float, nullable=True)

    def __repr__(self):
        return f"<CDM id={self.id} TCA={self.tca} SAT_1={self.sat_1_name} SAT_2={self.sat_2_name}>"
