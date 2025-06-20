from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models import Satellite, CollisionAlert
from app.utils.stats_utils import calculate_satellite_stats, calculate_debris_stats
from app.schemas import SatelliteListSchema, SatelliteDetailSchema, SatelliteStatsSchema

router = APIRouter()

@router.get("/satellites", response_model=SatelliteListSchema)
def get_satellites(
    norad_id: int = Query(None, description="NORAD ID del satélite"),
    name: str = Query(None, description="Nombre (o parte) del satélite"),
    object_type: str = Query(None, description="Tipo de objeto (ej: PAYLOAD, DEBRIS, ROCKET BODY)"),
    created_at: str = Query(None, description="Fecha de creación (YYYY-MM-DD opcional)"),
    updated_at: str = Query(None, description="Fecha de actualización (YYYY-MM-DD opcional)")
):
    """Obtiene lista de satélites filtrando solo por parámetros permitidos (no por source ni TLEs)"""
    db: Session = SessionLocal()
    try:
        query = db.query(Satellite)
        if norad_id is not None:
            query = query.filter(Satellite.norad_id == norad_id)
        if name:
            query = query.filter(Satellite.name.ilike(f"%{name}%"))
        if object_type:
            query = query.filter(Satellite.object_type == object_type)
        if created_at:
            query = query.filter(Satellite.created_at.cast("date") == created_at)
        if updated_at:
            query = query.filter(Satellite.updated_at.cast("date") == updated_at)
        satellites = query.all()
        data = [
            {
                "id": s.id,
                "norad_id": s.norad_id,
                "name": s.name,
                "tle_line1": s.tle_line1,
                "tle_line2": s.tle_line2,
                "object_type": s.object_type,
                "source": s.source,
                "created_at": s.created_at,
                "updated_at": s.updated_at,
            }
            for s in satellites
        ]
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo satélites: {str(e)}")
    finally:
        db.close()

@router.get("/satellites/stats", response_model=SatelliteStatsSchema)
def get_satellite_stats():
    """Devuelve estadísticas de satélites por tipo de objeto"""
    db: Session = SessionLocal()
    try:
        total = db.query(func.count(Satellite.id)).scalar()
        by_type = (
            db.query(Satellite.object_type, func.count(Satellite.id))
            .group_by(Satellite.object_type)
            .all()
        )
        stats = calculate_satellite_stats(by_type, total)
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")
    finally:
        db.close()

@router.get("/satellites/{norad_id}", response_model=SatelliteDetailSchema)
def get_satellite(norad_id: int):
    """Obtiene detalles de un satélite específico por NORAD ID e incluye alertas de colisión relacionadas"""
    db: Session = SessionLocal()
    try:
        sat = db.query(Satellite).filter(Satellite.norad_id == norad_id).first()
        if sat:
            # Buscar alertas donde el satélite es sat_1 o sat_2
            alerts = db.query(CollisionAlert).filter(
                (CollisionAlert.sat_1_id == str(norad_id)) | (CollisionAlert.sat_2_id == str(norad_id))
            ).all()
            alerts_data = [
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
            data = {
                "id": sat.id,
                "norad_id": sat.norad_id,
                "name": sat.name,
                "tle_line1": sat.tle_line1,
                "tle_line2": sat.tle_line2,
                "object_type": sat.object_type,
                "source": sat.source,
                "created_at": sat.created_at,
                "updated_at": sat.updated_at,
                "collision_alerts": alerts_data
            }
            return {"status": "success", "data": data}
        else:
            raise HTTPException(status_code=404, detail=f"Satélite con NORAD ID {norad_id} no encontrado")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo satélite: {str(e)}")
    finally:
        db.close()

@router.get("/debris", response_model=SatelliteListSchema)
def get_debris():
    """Obtiene lista de debris críticos desde la base de datos (object_type=DEBRIS)"""
    db: Session = SessionLocal()
    try:
        debris = db.query(Satellite).filter(Satellite.object_type == "DEBRIS").all()
        data = [
            {
                "id": d.id,
                "norad_id": d.norad_id,
                "name": d.name,
                "object_type": d.object_type,
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
    """Devuelve estadísticas de debris por origen y prioridad (object_type=DEBRIS)"""
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

@router.get("/debris/{norad_id}", response_model=SatelliteDetailSchema)
def get_debris_by_norad(norad_id: int):
    """Obtiene detalles de un debris específico por NORAD ID"""
    db: Session = SessionLocal()
    try:
        debris = db.query(Satellite).filter(Satellite.norad_id == norad_id, Satellite.object_type == "DEBRIS").first()
        if debris:
            from app.models import CollisionAlert
            alerts = db.query(CollisionAlert).filter(
                (CollisionAlert.sat_1_id == str(norad_id)) | (CollisionAlert.sat_2_id == str(norad_id))
            ).all()
            alerts_data = [
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
            data = {
                "id": debris.id,
                "norad_id": debris.norad_id,
                "name": debris.name,
                "tle_line1": debris.tle_line1,
                "tle_line2": debris.tle_line2,
                "object_type": debris.object_type,
                "source": debris.source,
                "created_at": debris.created_at,
                "updated_at": debris.updated_at,
                "collision_alerts": alerts_data
            }
            return {"status": "success", "data": data}
        else:
            raise HTTPException(status_code=404, detail=f"Debris con NORAD ID {norad_id} no encontrado")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo debris: {str(e)}")
    finally:
        db.close()

@router.get("/debris/filter", response_model=SatelliteListSchema)
def filter_debris(
    norad_id: int = Query(None, description="NORAD ID del debris"),
    name: str = Query(None, description="Nombre (o parte) del debris"),
    created_at: str = Query(None, description="Fecha de creación (YYYY-MM-DD opcional)"),
    updated_at: str = Query(None, description="Fecha de actualización (YYYY-MM-DD opcional)")
):
    """Filtra debris por los mismos parámetros permitidos (ahora incluye TLE y fuente en la respuesta)"""
    db: Session = SessionLocal()
    try:
        query = db.query(Satellite).filter(Satellite.object_type == "DEBRIS")
        if norad_id is not None:
            query = query.filter(Satellite.norad_id == norad_id)
        if name:
            query = query.filter(Satellite.name.ilike(f"%{name}%"))
        if created_at:
            query = query.filter(Satellite.created_at.cast("date") == created_at)
        if updated_at:
            query = query.filter(Satellite.updated_at.cast("date") == updated_at)
        debris_list = query.all()
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
            for d in debris_list
        ]
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtrando debris: {str(e)}")
    finally:
        db.close()
