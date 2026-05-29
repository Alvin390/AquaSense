# Demo data seed script — run with: python -m app.seeds.nairobi_seed
# Populates water_sources + water_readings + ai_recommendations with
# realistic pre-built data for Nairobi (5 sources) and Nyeri (1 source)
#
# Nairobi sources:
#   - Nairobi River (Westlands Crossing)       lat: -1.2635, lng: 36.8030
#   - Athi River / Mavoko Intake               lat: -1.3978, lng: 36.9540
#   - Mathare River (Mathare North)            lat: -1.2617, lng: 36.8637
#   - Ngong River (Kibera adjacent)            lat: -1.3025, lng: 36.7994
#   - Ruiru Reservoir intake                   lat: -1.1500, lng: 36.9700
#
# Nyeri source:
#   - Tana River headwaters (Aberdare foothills) lat: -0.4167, lng: 36.9500
#
# Each source gets a realistic reading + AI recommendation
# Seeded data is flagged with data_source='seeded' and is_demo_seed=True
