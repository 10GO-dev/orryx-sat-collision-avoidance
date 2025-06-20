from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from skyfield.api import load
from app.collision_detector import detect_close_approaches
from app.database import SessionLocal
from app.models import Satellite, CollisionAlert
from app.utils.collision_utils import run_collision_scan_logic
from app.schemas import MessageSchema

router = APIRouter()

ts = load.timescale()

@router.get("/collision-scan", response_model=MessageSchema)
def trigger_scan(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_collision_scan)
    return {"message": "🛰️ Collision scan started in the background."}

def run_collision_scan():
    db: Session = SessionLocal()
    try:
        db.query(CollisionAlert).delete()
        db.commit()
        satellites = db.query(Satellite).filter(Satellite.object_type.notin_(["DEBRIS", "ROCKET BODY"])).all()
        debris_and_rocket = db.query(Satellite).filter(Satellite.object_type.in_(["DEBRIS", "ROCKET BODY"])).all()
        results = run_collision_scan_logic(satellites, debris_and_rocket, detect_close_approaches, threshold_km=5)
        total_alerts = 0
        for sat_a, sat_b, time, distance_km in results:
            existing = (
                db.query(CollisionAlert)
                .filter_by(sat_a=sat_a, sat_b=sat_b, time=time)
                .first()
            )
            if not existing:
                alert = CollisionAlert(
                    sat_a=sat_a,
                    sat_b=sat_b,
                    time=time,
                    distance_km=distance_km,
                )
                db.add(alert)
                total_alerts += 1
        db.commit()
        return {"message": f"Scan complete. {total_alerts} close approaches found."}
    finally:
        db.close()

@router.get("/collision")
def collision_check(norad1: int = Query(...), norad2: int = Query(...)):
    db: Session = SessionLocal()
    sat1 = db.query(Satellite).filter(Satellite.norad_id == norad1).first()
    sat2 = db.query(Satellite).filter(Satellite.norad_id == norad2).first()
    if not sat1 or not sat2:
        db.close()
        raise HTTPException(status_code=404, detail="One or both satellites not found")
    alerts = (
        db.query(CollisionAlert)
        .filter(
            ((CollisionAlert.sat_a == sat1.name) & (CollisionAlert.sat_b == sat2.name))
            | ((CollisionAlert.sat_a == sat2.name) & (CollisionAlert.sat_b == sat1.name))
        )
        .order_by(CollisionAlert.time.asc())
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

@router.get("/top-collision")
def get_top_collisions(limit: int = 5):
    db: Session = SessionLocal()
    try:
        alerts = (
            db.query(CollisionAlert)
            .filter(CollisionAlert.min_rng > 0.0)
            .order_by(CollisionAlert.min_rng.asc())
            .limit(limit)
            .all()
        )
        return [
            {
                "time": alert.time,
                "sat_a": alert.sat_a,
                "sat_b": alert.sat_b,
                "distance_km": round(alert.distance_km, 3),
            }
            for alert in alerts
        ]
    finally:
        db.close()
