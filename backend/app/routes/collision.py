from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Satellite, collisionAlert

router = APIRouter()


@router.get("/collision")
def collision_check(norad1: int = Query(...), norad2: int = Query(...)):
    db: Session = SessionLocal()

    sat1 = db.query(Satellite).filter(Satellite.norad_id == norad1).first()
    sat2 = db.query(Satellite).filter(Satellite.norad_id == norad2).first()

    if not sat1 or not sat2:
        db.close()
        raise HTTPException(status_code=404, detail="One or both satellites not found")

    # 🔍 Query precomputed alerts instead of recomputing
    alerts = (
        db.query(collisionAlert)
        .filter(
            ((collisionAlert.sat_a == sat1.name) & (collisionAlert.sat_b == sat2.name))
            | (
                (collisionAlert.sat_a == sat2.name)
                & (collisionAlert.sat_b == sat1.name)
            )
        )
        .order_by(collisionAlert.time.asc())
        .all()
    )

    db.close()

    return {
        "satellite_1": {"norad_id": norad1, "name": sat1.name},
        "satellite_2": {"norad_id": norad2, "name": sat2.name},
        "close_approaches": [
            {"time": alert.time, "distance_km": round(alert.distance_km, 3)}
            for alert in alerts
        ],
    }
