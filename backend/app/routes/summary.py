from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models import Satellite, CDM, TLEMetadata
from app.utils.stats_utils import build_system_summary
from app.schemas import SummarySchema

router = APIRouter()

@router.get("/summary", response_model=SummarySchema)
def get_summary():
    """Obtiene resumen general del sistema desde la base de datos"""
    db: Session = SessionLocal()
    try:
        total_satellites = db.query(func.count(Satellite.id)).scalar()
        total_debris = db.query(func.count(Satellite.id)).filter(Satellite.object_type == "DEBRIS").scalar()
        total_cdm = db.query(func.count(CDM.id)).scalar()
        last_tle_fetch = db.query(TLEMetadata).order_by(TLEMetadata.last_fetched_at.desc()).first()
        last_fetch_time = last_tle_fetch.last_fetched_at if last_tle_fetch else None
        summary = build_system_summary(total_satellites, total_debris, total_cdm, last_fetch_time)
        return {
            "status": "success",
            "data": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo resumen: {str(e)}")
    finally:
        db.close()
