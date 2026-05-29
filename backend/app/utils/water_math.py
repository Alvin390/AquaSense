# Water quality calculation utilities
# ndwi(b3, b8) → float  — Normalized Difference Water Index
# turbidity_proxy(b4, b3) → float
# flood_index(ndwi, b11) → float
# quality_score(ph, turbidity, ndwi) → int (0–100)
# quantity_score(water_level, rainfall_mm, river_discharge) → int (0–100)
# safe_range_status(value, low, high) → 'SAFE' | 'CAUTION' | 'UNSAFE'
