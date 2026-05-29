# Alerts router — /alerts prefix
# GET /alerts/active → active alerts near given lat/lng within radius_km
# Alert types: ph_critical, flood_high, water_scarce
# Returns list of AlertResponse objects ordered by triggered_at DESC
