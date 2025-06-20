from skyfield.api import EarthSatellite, load

ts = load.timescale()

def get_altitude_km(tle1, tle2, name):
    """
    Calcula la altitud (en km) de un satélite a partir de sus líneas TLE y nombre.
    """
    sat = EarthSatellite(tle1, tle2, name, ts)
    return sat.at(ts.now()).subpoint().elevation.km

def run_collision_scan_logic(satellites, debris_and_rocket, detect_close_approaches_func, threshold_km=5):
    """
    Lógica principal para escanear posibles colisiones entre satélites y objetos (debris/rocket bodies).
    Retorna una lista de tuplas (sat_a, sat_b, time, distance_km).
    """
    results = []
    for sat in satellites:
        for obj in debris_and_rocket:
            approaches = detect_close_approaches_func(
                sat.tle_line1, sat.tle_line2, sat.name,
                obj.tle_line1, obj.tle_line2, obj.name,
                threshold_km=threshold_km,
            )
            for approach in approaches:
                results.append((sat.name, obj.name, approach["time"], approach["distance_km"]))
    return results
