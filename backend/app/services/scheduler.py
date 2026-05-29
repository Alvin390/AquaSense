# APScheduler — 36-hour data refresh job
# Job: fetch_all_sources_job()
#   1. Load all water sources from DB
#   2. For each source: call sentinel_service, weather_service, pollution_service
#   3. Combine readings → save WaterReading to DB
#   4. Call ai_service → save AIRecommendation to DB
#   5. Run alert_engine → write AlertLog if thresholds exceeded
# Scheduler started in FastAPI startup event; stopped in shutdown event
