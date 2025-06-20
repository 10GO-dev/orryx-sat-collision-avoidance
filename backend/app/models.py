# app/models.py
from datetime import datetime

from pydash import update
from sqlalchemy import Column, DateTime, Float, Integer, String, UniqueConstraint

from app.database import Base


class Satellite(Base):
    __tablename__ = "satellites"
    id = Column(Integer, primary_key=True, index=True)
    norad_id = Column(Integer, unique=True, index=True)
    name = Column(String, index=True)
    tle_line1 = Column(String)
    tle_line2 = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    __table_args__ = (UniqueConstraint("norad_id", name="uq_norad_id"),)


class collisionAlert(Base):
    __tablename__ = "collision_alerts"
    id = Column(Integer, primary_key=True, index=True)
    sat_a = Column(String, nullable=False)
    sat_b = Column(String, nullable=False)
    time = Column(String, nullable=False)
    distance_km = Column(Float, nullable=False)


class TLEMetadata(Base):
    __tablename__ = "tle_metadata"
    id = Column(Integer, primary_key=True, index=True)
    last_fetched_at = Column(DateTime, default=datetime.now)


class Debris(Base):
    __tablename__ = "debris"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tle_line1 = Column(String, nullable=False)
    tle_line2 = Column(String, nullable=False)
    source = Column(String, nullable=True)  # Optional: to track data source
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


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
