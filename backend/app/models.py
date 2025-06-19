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
