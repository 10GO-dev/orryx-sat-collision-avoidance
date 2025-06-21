# app/tle_fetcher.py
from datetime import datetime, timedelta

import requests

from app.database import SessionLocal
from app.models import Satellite, TLEMetadata

CELESTRAK_URL = "https://celestrak.com/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"

DEBRIS_SOURCES = [
    ("cosmos-1408-debris", "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-1408-debris&FORMAT=tle"),
    ("fengyun-1c-debris", "https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=tle"),
    ("iridium-33-debris", "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle"),
    ("cosmos-2251-debris", "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=tle"),
]


def extract_norad_id(tle_line1: str) -> int:
    return int(tle_line1[2:7].strip())


def detect_object_type(name: str) -> str:
    name_upper = name.upper()
    if "DEB" in name_upper or "DEBRIS" in name_upper:
        return "DEBRIS"
    if "R/B" in name_upper or "ROCKET BODY" in name_upper:
        return "ROCKET BODY"
    if "PAYLOAD" in name_upper:
        return "PAYLOAD"
    # Puedes agregar más reglas según tus datos
    return "PAYLOAD"  # Valor por defecto


def fetch_and_store_tles():
    db = SessionLocal()
    try:
        # ✅ Step 1: Check last fetched time
        meta = db.query(TLEMetadata).first()
        now = datetime.utcnow()

        if meta and (now - meta.last_fetched_at) < timedelta(hours=6):
            print("⏳ Skipping TLE fetch – already fetched within last 6 hours.")
            return

        # ✅ Step 2: Fetch from CelesTrak (active satellites)
        print("📡 Fetching TLEs from CelesTrak (active satellites)...")
        response = requests.get(CELESTRAK_URL)
        data = response.text.strip().split("\n")

        count = 0
        for i in range(0, len(data), 3):
            try:
                name = data[i].strip()
                tle1 = data[i + 1].strip()
                tle2 = data[i + 2].strip()
                norad_id = extract_norad_id(tle1)

                sat = db.query(Satellite).filter(Satellite.norad_id == norad_id).first()

                object_type = detect_object_type(name)
                if sat:
                    sat.name = name
                    sat.tle_line1 = tle1
                    sat.tle_line2 = tle2
                    sat.source = "CelesTrak"
                    sat.object_type = object_type
                else:
                    sat = Satellite(
                        norad_id=norad_id,
                        name=name,
                        tle_line1=tle1,
                        tle_line2=tle2,
                        source="CelesTrak",
                        object_type=object_type,
                    )
                    db.add(sat)
                count += 1
            except Exception as e:
                print(f"Error parsing TLE: {e}")

        # ✅ Step 3: Fetch debris from specific sources
        for debris_name, debris_url in DEBRIS_SOURCES:
            print(f"📡 Fetching debris TLEs from {debris_name}...")
            try:
                debris_response = requests.get(debris_url)
                debris_data = debris_response.text.strip().split("\n")
                for i in range(0, len(debris_data), 3):
                    try:
                        name = debris_data[i].strip()
                        tle1 = debris_data[i + 1].strip()
                        tle2 = debris_data[i + 2].strip()
                        norad_id = extract_norad_id(tle1)
                        sat = db.query(Satellite).filter(Satellite.norad_id == norad_id).first()
                        object_type = "DEBRIS"
                        if sat:
                            sat.name = name
                            sat.tle_line1 = tle1
                            sat.tle_line2 = tle2
                            sat.source = debris_name
                            sat.object_type = object_type
                        else:
                            sat = Satellite(
                                norad_id=norad_id,
                                name=name,
                                tle_line1=tle1,
                                tle_line2=tle2,
                                source=debris_name,
                                object_type=object_type,
                            )
                            db.add(sat)
                    except Exception as e:
                        print(f"Error parsing debris TLE from {debris_name}: {e}")
            except Exception as e:
                print(f"Error fetching debris from {debris_name}: {e}")

        # ✅ Step 4: Update metadata
        if not meta:
            meta = TLEMetadata(last_fetched_at=now)
            db.add(meta)
        else:
            meta.last_fetched_at = now
        db.commit()
        print(f"✅ Fetched and stored {count} active satellites and debris TLEs.")
    finally:
        db.close()
