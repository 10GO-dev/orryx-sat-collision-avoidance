from fastapi import APIRouter, BackgroundTasks
from skyfield.api import EarthSatellite, load
from sqlalchemy.orm import Session

from app.collision_detector import detect_close_approaches
from app.database import SessionLocal
from app.models import Satellite, collisionAlert

router = APIRouter()

ts = load.timescale()


def get_altitude_km(tle1, tle2, name):
    sat = EarthSatellite(tle1, tle2, name, ts)
    return sat.at(ts.now()).subpoint().elevation.km


@router.get("/collision-scan")
def trigger_scan(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_collision_scan)
    return {"message": "🛰️ Collision scan started in the background."}


def run_collision_scan():
    db: Session = SessionLocal()

    try:
        # clear collision alert table before checking
        db.query(collisionAlert).delete()
        db.commit()

        # query to get ISS and other satellites
        iss = db.query(Satellite).filter(Satellite.norad_id == 25544).first()
        all_sats = db.query(Satellite).filter(Satellite.norad_id != 25544).all()

        if not iss:
            return {"message": "ISS not found in DB."}

        total_alerts = 0

        DOCKED_OR_MODULE_NAMES = [
            "PROGRESS",
            "SOYUZ",
            "ZARYA",
            "NAUKA",
            "KIBO",
            "COLUMBUS",
            "DESTINY",
            "HTV",
            "CYGNUS",
            "DRAGON",
            "TIANGONG",
        ]

        iss_alt = get_altitude_km(iss.tle_line1, iss.tle_line2, iss.name)

        for sat in all_sats:
            sat_alt = get_altitude_km(sat.tle_line1, sat.tle_line2, sat.name)

            name_upper = sat.name.upper()

            if any(term in name_upper for term in DOCKED_OR_MODULE_NAMES):
                continue  # 🚫 skip known docked vehicles or ISS modules

            if abs(iss_alt - sat_alt) < 0.1:
                continue  # to avoid modules, subcomponents, docking satellites

            if abs(iss_alt - sat_alt) > 100:
                continue  # skip if too far apart in altitude

            if "ISS" in iss.name and "ISS" in sat.name:
                continue  # skip subcomponents of ISS

            approaches = detect_close_approaches(
                iss.tle_line1,
                iss.tle_line2,
                iss.name,
                sat.tle_line1,
                sat.tle_line2,
                sat.name,
                threshold_km=100.0,
            )
            for approach in approaches:
                existing = (
                    db.query(collisionAlert)
                    .filter_by(sat_a=iss.name, sat_b=sat.name, time=approach["time"])
                    .first()
                )

                if not existing:
                    alert = collisionAlert(
                        sat_a=iss.name,
                        sat_b=sat.name,
                        time=approach["time"],
                        distance_km=approach["distance_km"],
                    )
                    db.add(alert)
                    total_alerts += 1

        db.commit()
        return {"message": f"Scan complete. {total_alerts} close approaches found."}

    finally:
        db.close()
        # clear collision alert table before checking

        # query to get ISS and other satellites
