from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import CDM, CollisionAlert

def scan_cdm_for_alerts():
    """Escanea los CDM recientes y crea alertas de colisión si cumplen criterios de riesgo."""
    db: Session = SessionLocal()
    try:
        since = datetime.utcnow() - timedelta(hours=24)
        cdms = db.query(CDM).filter(CDM.created >= since).all()
        for cdm in cdms:
            # Criterios de riesgo: min_rng < 2km o PC > 1e-4
            if (cdm.min_rng is not None and float(cdm.min_rng) < 2.0) or \
               (cdm.pc is not None and float(cdm.pc) > 1e-4):
                exists = db.query(CollisionAlert).filter_by(cdm_id=cdm.id).first()
                if not exists:
                    alert = CollisionAlert(
                        cdm_id=cdm.id,
                        sat_1_id=cdm.sat_1_id,
                        sat_2_id=cdm.sat_2_id,
                        tca=cdm.tca,
                        min_rng=cdm.min_rng,
                        pc=cdm.pc,
                        created=datetime.utcnow()
                    )
                    db.add(alert)
        db.commit()
    finally:
        db.close()
