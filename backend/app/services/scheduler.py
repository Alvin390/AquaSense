# # from apscheduler.schedulers.asyncio import AsyncIOScheduler

# # scheduler = AsyncIOScheduler()


# # async def fetch_all_sources_job() -> None:
# #     # TODO: Alvin
# #     # 1. Load all WaterSource rows from DB
# #     # 2. For each: sentinel_service → weather_service → pollution_service
# #     # 3. Compute ndwi/quality/quantity scores (water_math)
# #     # 4. Save WaterReading to DB
# #     # 5. ai_service → save AIRecommendation to DB
# #     # 6. alert_engine → upsert AlertLog if thresholds exceeded
# #     pass


# # def start_scheduler() -> None:
# #     scheduler.add_job(fetch_all_sources_job, "interval", hours=36, id="data_refresh")
# #     scheduler.start()


# # def stop_scheduler() -> None:
# #     scheduler.shutdown(wait=False)


# import logging
# from apscheduler.schedulers.asyncio import AsyncIOScheduler
# from sqlalchemy import select
# from datetime import datetime, timezone

# from app.database import AsyncSessionLocal
# from app.models.water_source import WaterSource
# from app.models.water_reading import WaterReading
# from app.models.ai_recommendation import AIRecommendation

# from app.services.sentinel_service import fetch_satellite_data
# from app.services.weather_service import fetch_weather_data
# from app.services.pollution_service import fetch_pollution_data

# # Alvin's AI service (Importing his interface)
# # from app.services.ai_service import generate_recommendation

# # logger = logging.getLogger(__name__)
# # scheduler = AsyncIOScheduler()

# # async def fetch_all_data_job():
# #     logger.info("Starting 36-hour data fetch cycle...")
# #     async with AsyncSessionLocal() as db:
# #         result = await db.execute(select(WaterSource))
# #         sources = result.scalars().all()
        
# #         for source in sources:
# #             try:
# #                 # 1. Fetch data from all APIs
# #                 sat_data = await fetch_satellite_data(source.latitude, source.longitude)
# #                 weather_data = await fetch_weather_data(source.latitude, source.longitude)
# #                 poll_data = await fetch_pollution_data(source.latitude, source.longitude)
                
# #                 # 2. Store the Water Reading
# #                 reading = WaterReading(
# #                     source_id=source.id,
# #                     ph=7.2, # Seeded baseline
# #                     turbidity=sat_data.get("turbidity_proxy", 15.0),
# #                     flood_risk_pct=sat_data.get("flood_index", 0.0) * 100,
# #                     water_level="Normal",
# #                     rainfall_mm=weather_data.get("precipitation_sum_24h", 0.0),
# #                     dissolved_oxygen=8.5,
# #                     pollution_index=poll_data.get("pollution_index"),
# #                     ndwi=sat_data.get("ndwi", 0.3),
# #                     data_source="pipeline",
# #                     fetched_at=datetime.now(timezone.utc)
# #                 )
# #                 db.add(reading)
# #                 await db.commit()
# #                 await db.refresh(reading)
                
# #                 # 3. Trigger Alvin's AI Engine
# #                 ai_result = await generate_recommendation(reading)
                
# #                 # 4. Store AI Recommendation
# #                 ai_rec = AIRecommendation(
# #                     reading_id=reading.id,
# #                     source_id=source.id,
# #                     risk_label=ai_result.get("risk_label", "SAFE"),
# #                     summary=ai_result.get("summary", "Data updated successfully."),
# #                     recommendations=ai_result.get("recommendations", []),
# #                     data_drivers=ai_result.get("data_drivers", []),
# #                     quality_score=ai_result.get("quality_score", 85),
# #                     quantity_score=ai_result.get("quantity_score", 85),
# #                     generated_at=datetime.now(timezone.utc)
# #                 )
# #                 db.add(ai_rec)
# #                 await db.commit()
                
# #                 logger.info(f"Successfully processed pipeline for {source.name}")
# #             except Exception as e:
# #                 logger.error(f"Pipeline failed for {source.name}: {e}")
# # Alvin's AI service (Importing his interface with a safe hackathon fallback)
# try:
#     from app.services.ai_service import generate_recommendation
# except ImportError:
#     logger.warning("Alvin's generate_recommendation not found in ai_service.py. Deploying local mock fallback for demo stability.")
    
#     async def generate_recommendation(reading):
#         """Temporary mock fallback so the server boots and runs until Alvin merges."""
#         return {
#             "risk_label": "SAFE",
#             "summary": "Satellite and weather data pipeline stable. AI Engine evaluation pending.",
#             "recommendations": ["Continue routine water quality monitoring.", "Check dashboard for real-time sensor updates."],
#             "data_drivers": ["Precipitation Baseline", "NDWI Normal"],
#             "quality_score": 88,
#             "quantity_score": 85
#         }
# def start_scheduler():
#     scheduler.add_job(fetch_all_data_job, 'interval', hours=36)
#     scheduler.start()
#     logger.info("Scheduler started.")

# def stop_scheduler():
#     scheduler.shutdown()

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from datetime import datetime, timezone

from app.database import AsyncSessionLocal
from app.models.water_source import WaterSource
from app.models.water_reading import WaterReading
from app.models.ai_recommendation import AIRecommendation

from app.services.sentinel_service import fetch_satellite_data
from app.services.weather_service import fetch_weather_data
from app.services.pollution_service import fetch_pollution_data

# 1. Initialize core utilities first
logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

# 2. Try importing Alvin's AI service, fallback to a safe mock if empty/missing
try:
    from app.services.ai_service import generate_recommendation
except ImportError:
    logger.warning("Alvin's generate_recommendation not found in ai_service.py. Deploying local mock fallback for demo stability.")
    
    async def generate_recommendation(reading):
        """Temporary mock fallback so the server boots and runs until Alvin merges."""
        return {
            "risk_label": "SAFE",
            "summary": "Satellite and weather data pipeline stable. AI Engine evaluation pending.",
            "recommendations": ["Continue routine water quality monitoring.", "Check dashboard for real-time sensor updates."],
            "data_drivers": ["Precipitation Baseline", "NDWI Normal"],
            "quality_score": 88,
            "quantity_score": 85
        }

# 3. The 36-hour background data pipeline job
async def fetch_all_data_job():
    logger.info("Starting 36-hour data fetch cycle...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(WaterSource))
        sources = result.scalars().all()
        
        for source in sources:
            try:
                # 1. Fetch data from all APIs
                sat_data = await fetch_satellite_data(source.latitude, source.longitude)
                weather_data = await fetch_weather_data(source.latitude, source.longitude)
                poll_data = await fetch_pollution_data(source.latitude, source.longitude)
                
                # 2. Store the Water Reading
                reading = WaterReading(
                    source_id=source.id,
                    ph=7.2, # Seeded baseline
                    turbidity=sat_data.get("turbidity_proxy", 15.0),
                    flood_risk_pct=sat_data.get("flood_index", 0.0) * 100,
                    water_level="Normal",
                    rainfall_mm=weather_data.get("precipitation_sum_24h", 0.0),
                    dissolved_oxygen=8.5,
                    pollution_index=poll_data.get("pollution_index"),
                    ndwi=sat_data.get("ndwi", 0.3),
                    data_source="pipeline",
                    fetched_at=datetime.now(timezone.utc)
                )
                db.add(reading)
                await db.commit()
                await db.refresh(reading)
                
                # 3. Trigger AI Engine (safely falls back to mock if Alvin's file is empty)
                ai_result = await generate_recommendation(reading)
                
                # 4. Store AI Recommendation
                ai_rec = AIRecommendation(
                    reading_id=reading.id,
                    source_id=source.id,
                    risk_label=ai_result.get("risk_label", "SAFE"),
                    summary=ai_result.get("summary", "Data updated successfully."),
                    recommendations=ai_result.get("recommendations", []),
                    data_drivers=ai_result.get("data_drivers", []),
                    quality_score=ai_result.get("quality_score", 85),
                    quantity_score=ai_result.get("quantity_score", 85),
                    generated_at=datetime.now(timezone.utc)
                )
                db.add(ai_rec)
                await db.commit()
                
                logger.info(f"Successfully processed pipeline for {source.name}")
            except Exception as e:
                logger.error(f"Pipeline failed for {source.name}: {e}")

# 4. Lifecycle control hooks for the scheduler
def start_scheduler():
    scheduler.add_job(fetch_all_data_job, 'interval', hours=36, id="data_refresh")
    scheduler.start()
    logger.info("Scheduler started.")

def stop_scheduler():
    scheduler.shutdown()