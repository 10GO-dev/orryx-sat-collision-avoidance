from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import collisionAlert

router = APIRouter()


@router.get("/top-collision")
def get_top_collisions(limit: int = 5):
    db: Session = SessionLocal()
    try:
        alerts = (
            db.query(collisionAlert)
            # .filter(collisionAlert.sat_a != collisionAlert.sat_b)
            .filter(collisionAlert.distance_km > 0.0)
            .order_by(collisionAlert.distance_km.asc())
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
