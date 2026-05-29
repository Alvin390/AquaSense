# Alert engine — evaluates latest reading against system-defined thresholds
# Thresholds:
#   ph_critical:   ph < 6.0 or ph > 9.0
#   flood_high:    flood_risk_pct > 65
#   water_scarce:  water_level in ('Very Low', 'Dry')
# On breach: upserts AlertLog record, respects 6-hour notification throttle
# Returns list of active alert types for the source
