from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()


async def fetch_all_sources_job() -> None:
    # TODO: Alvin
    # 1. Load all WaterSource rows from DB
    # 2. For each: sentinel_service → weather_service → pollution_service
    # 3. Compute ndwi/quality/quantity scores (water_math)
    # 4. Save WaterReading to DB
    # 5. ai_service → save AIRecommendation to DB
    # 6. alert_engine → upsert AlertLog if thresholds exceeded
    pass


def start_scheduler() -> None:
    scheduler.add_job(fetch_all_sources_job, "interval", hours=36, id="data_refresh")
    scheduler.start()


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
