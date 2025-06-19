from datetime import datetime, timedelta

import numpy as np
from skyfield.api import EarthSatellite, load


def extract_position_series(tle1, tle2, name, duration_hours=24, interval_minutes=10):
    ts = load.timescale()
    satellite = EarthSatellite(tle1, tle2, name, ts)

    start_time = datetime.utcnow()
    steps = int((duration_hours * 60) / interval_minutes)
    times = [start_time + timedelta(minutes=i * interval_minutes) for i in range(steps)]

    skyfield_times = ts.utc(
        [t.year for t in times],
        [t.month for t in times],
        [t.day for t in times],
        [t.hour for t in times],
        [t.minute for t in times],
        [t.second for t in times],
    )

    positions = satellite.at(skyfield_times).position.km  # returns 3D array
    return times, np.array(positions).T  # shape: (steps, 3)


def detect_close_approaches(
    tle1_a, tle2_a, name_a, tle1_b, tle2_b, name_b, threshold_km=5.0
):
    times_a, pos_a = extract_position_series(tle1_a, tle2_a, name_a)
    times_b, pos_b = extract_position_series(tle1_b, tle2_b, name_b)

    assert len(times_a) == len(times_b), "Time steps must match"

    close_approaches = []

    for i in range(len(times_a)):
        dist = np.linalg.norm(pos_a[i] - pos_b[i])
        if dist < threshold_km:
            close_approaches.append(
                {"time": times_a[i].isoformat() + "Z", "distance_km": round(dist, 3)}
            )

    return close_approaches
