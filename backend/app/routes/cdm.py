from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import CDM
from app.schemas import CDMListSchema

router = APIRouter()

@router.get("/cdm", response_model=CDMListSchema)
def get_cdms():
    """Obtiene todos los CDM (conjunciones) desde la base de datos"""
    db: Session = SessionLocal()
    try:
        cdms = db.query(CDM).all()
        data = [
            {
                "id": c.id,
                "created": c.created,
                "emergency_reportable": c.emergency_reportable,
                "tca": c.tca,
                "min_rng": c.min_rng,
                "pc": c.pc,
                "sat_1_id": c.sat_1_id,
                "sat_1_name": c.sat_1_name,
                "sat1_object_type": c.sat1_object_type,
                "sat1_rcs": c.sat1_rcs,
                "sat_1_excl_vol": c.sat_1_excl_vol,
                "sat_2_id": c.sat_2_id,
                "sat_2_name": c.sat_2_name,
                "sat2_object_type": c.sat2_object_type,
                "sat2_rcs": c.sat2_rcs,
                "sat_2_excl_vol": c.sat_2_excl_vol,
            }
            for c in cdms
        ]
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo CDMs: {str(e)}")
    finally:
        db.close()
