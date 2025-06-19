from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Satellite
from app.orbitSimulator import simulate_orbit

router = APIRouter()


@router.get("/orbit/norad/{norad_id}")
def get_orbit_by_norad(norad_id):
    db: Session = SessionLocal()

    # Step 1: Fetch the satellite by ID
    satellite = db.query(Satellite).filter(Satellite.norad_id == norad_id).first()

    if not satellite:
        raise HTTPException(status_code=404, detail="Satellite not found")

    # Step 2: Simulate the orbit using Skyfield
    result = simulate_orbit(
        satellite.tle_line1,
        satellite.tle_line2,
        satellite.name,
        duration_hours=24,
        interval_minutes=10,
    )

    db.close()
    return result
