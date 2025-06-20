# Este archivo ha sido deprecado. Las rutas de debris ahora están en satellites.py.

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Satellite
from sqlalchemy import func
from app.utils.stats_utils import calculate_debris_stats

router = APIRouter()

@router.get("/debris")
def get_debris():
    """Obtiene lista de debris críticos desde la base de datos"""
    db: Session = SessionLocal()
    try:
        debris = db.query(Satellite).filter(Satellite.object_type == "DEBRIS").all()
        data = [
            {
                "id": d.id,
                "norad_id": d.norad_id,
                "name": d.name,
                "tle_line1": d.tle_line1,
                "tle_line2": d.tle_line2,
                "object_type": d.object_type,
                "source": d.source,
                "created_at": d.created_at,
                "updated_at": d.updated_at,
            }
            for d in debris
        ]
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo debris: {str(e)}")
    finally:
        db.close()

@router.get("/debris/stats")
def get_debris_stats():
    """Devuelve estadísticas de debris por origen y prioridad"""
    db: Session = SessionLocal()
    try:
        debris = db.query(Satellite).filter(Satellite.object_type == "DEBRIS").all()
        stats = calculate_debris_stats(debris)
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas de debris: {str(e)}")
    finally:
        db.close()
