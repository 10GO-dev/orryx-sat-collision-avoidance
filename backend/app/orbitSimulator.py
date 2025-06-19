from datetime import datetime, timedelta

from skyfield.api import EarthSatellite, load


def simulate_orbit(tle_line1, tle_line2, name, duration_hours=24, interval_minutes=10):
    ts = load.timescale()
    satellite = EarthSatellite(tle_line1, tle_line2, name, ts)

    # Step 1: Generate time steps
    start_time = datetime.utcnow()
    steps = int((duration_hours * 60) / interval_minutes)
    times = [start_time + timedelta(minutes=i * interval_minutes) for i in range(steps)]

    # Step 2: Convert to Skyfield time objects
    skyfield_times = ts.utc(
        [t.year for t in times],
        [t.month for t in times],
        [t.day for t in times],
        [t.hour for t in times],
        [t.minute for t in times],
        [t.second for t in times],
    )

    # Step 3: Compute positions
    geocentric = satellite.at(skyfield_times)
    subpoints = geocentric.subpoint()

    results = []
    for i in range(len(times)):
        results.append(
            {
                "time": times[i].isoformat() + "Z",
                "lat": round(subpoints.latitude.degrees[i], 4),
                "lon": round(subpoints.longitude.degrees[i], 4),
                "alt": round(subpoints.elevation.km[i], 2),
            }
        )

    return results
