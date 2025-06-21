def calculate_debris_stats(debris_list):
    """
    Calcula estadísticas de debris por origen y prioridad a partir de una lista de objetos debris.
    """
    total_debris = len(debris_list)
    origins = {}
    high_priority = 0
    for d in debris_list:
        name = (d.name or "").upper()
        if "COSMOS-1408" in name:
            origins["cosmos_1408"] = origins.get("cosmos_1408", 0) + 1
        elif "FENGYUN-1C" in name:
            origins["fengyun_1c"] = origins.get("fengyun_1c", 0) + 1
        elif "IRIDIUM-33" in name:
            origins["iridium_33"] = origins.get("iridium_33", 0) + 1
        elif "COSMOS-2251" in name:
            origins["cosmos_2251"] = origins.get("cosmos_2251", 0) + 1
        else:
            origins["other"] = origins.get("other", 0) + 1
        if "COSMOS" in name or "FENGYUN" in name:
            high_priority += 1
    return {
        "total_debris": total_debris,
        "by_origin": origins,
        "high_priority": high_priority
    }

def calculate_satellite_stats(by_type, total):
    """
    Calcula estadísticas de satélites por tipo de objeto.
    """
    stats = {t or "UNKNOWN": c for t, c in by_type}
    return {
        "total": total,
        "by_type": stats
    }

def build_system_summary(total_satellites, total_debris, total_cdm, last_tle_fetch_time, total_alerts):
    """
    Construye el resumen general del sistema para el endpoint /summary.
    """
    summary = {
        "total_satellites": total_satellites,
        "total_debris": total_debris,
        "total_cdm": total_cdm,
        "last_tle_fetch_time": last_tle_fetch_time,
        "collision_alerts": total_alerts
    }
    print("System Summary:", summary)  # Debugging line to check the summary structure
    return summary
