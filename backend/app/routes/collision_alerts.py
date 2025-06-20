from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import CollisionAlert
from app.schemas import CollisionAlertListSchema

router = APIRouter()

@router.get("/collision-alerts", response_model=CollisionAlertListSchema)
def get_collision_alerts():
    """Obtiene solo alertas de colisión críticas desde la base de datos"""
    db: Session = SessionLocal()
    try:
        alerts = db.query(CollisionAlert).all()
        data = [
            {
                "id": a.id,
                "cdm_id": a.cdm_id,
                "created": a.created,
                "tca": a.tca,
                "min_rng": a.min_rng,
                "pc": a.pc,
                "sat_1_id": a.sat_1_id,
                "sat_1_name": a.sat_1_name,
                "sat_2_id": a.sat_2_id,
                "sat_2_name": a.sat_2_name,
                "risk_level": a.risk_level,
                "alert_reason": a.alert_reason,
            }
            for a in alerts
        ]
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo alertas de colisión: {str(e)}")
    finally:
        db.close()
