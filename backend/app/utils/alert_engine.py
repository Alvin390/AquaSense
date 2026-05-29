def check_alerts(ph: float, flood_risk_pct: float, water_level: str) -> list[str]:
    """Evaluate a reading against system thresholds. Returns triggered alert type strings."""
    alerts: list[str] = []
    if ph < 6.0 or ph > 9.0:
        alerts.append("ph_critical")
    if flood_risk_pct > 65:
        alerts.append("flood_high")
    if water_level in ("Very Low", "Dry"):
        alerts.append("water_scarce")
    return alerts
