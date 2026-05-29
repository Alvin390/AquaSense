# WaterReading ORM model
# Table: water_readings
# Fields: id, source_id (FK), ph, turbidity, flood_risk_pct,
#         water_level (Normal|Low|Very Low|Flooded|Dry), rainfall_mm,
#         dissolved_oxygen, pollution_index (nullable), ndwi,
#         data_source (sentinel_hub|seeded|cached), fetched_at
# Index: (source_id, fetched_at DESC) — hot path for latest-reading query
