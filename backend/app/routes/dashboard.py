from datetime import datetime

from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Satellite, TLEMetadata, collisionAlert

router = APIRouter()


@router.get("/summary")
def get_summary():
    db: Session = SessionLocal()

    count = db.query(Satellite).count()
    collisions = db.query(collisionAlert).count()
    metadata = db.query(TLEMetadata).first()
    last_fetch = (
        metadata.last_fetched_at.strftime("%Y-%m-%d %H:%M:%S") + " UTC"
        if metadata
        else None
    )
    db.close()

    return {
        "total_satellites": count,
        "last_sync": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "collision_count": collisions,
        "last_fetch_time": last_fetch,
    }
