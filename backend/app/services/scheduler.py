# # # from apscheduler.schedulers.asyncio import AsyncIOScheduler

# # # scheduler = AsyncIOScheduler()


# # # async def fetch_all_sources_job() -> None:
# # #     # TODO: Alvin
# # #     # 1. Load all WaterSource rows from DB
# # #     # 2. For each: sentinel_service → weather_service → pollution_service
# # #     # 3. Compute ndwi/quality/quantity scores (water_math)
# # #     # 4. Save WaterReading to DB
# # #     # 5. ai_service → save AIRecommendation to DB
# # #     # 6. alert_engine → upsert AlertLog if thresholds exceeded
# # #     pass


# # # def start_scheduler() -> None:
# # #     scheduler.add_job(fetch_all_sources_job, "interval", hours=36, id="data_refresh")
# # #     scheduler.start()


# # # def stop_scheduler() -> None:
# # #     scheduler.shutdown(wait=False)


# # import logging
# # from apscheduler.schedulers.asyncio import AsyncIOScheduler
# # from sqlalchemy import select
# # from datetime import datetime, timezone

# # from app.database import AsyncSessionLocal
# # from app.models.water_source import WaterSource
# # from app.models.water_reading import WaterReading
# # from app.models.ai_recommendation import AIRecommendation

# # from app.services.sentinel_service import fetch_satellite_data
# # from app.services.weather_service import fetch_weather_data
# # from app.services.pollution_service import fetch_pollution_data

# # # Alvin's AI service (Importing his interface)
# # # from app.services.ai_service import generate_recommendation

# # # logger = logging.getLogger(__name__)
# # # scheduler = AsyncIOScheduler()

# # # async def fetch_all_data_job():
# # #     logger.info("Starting 36-hour data fetch cycle...")
# # #     async with AsyncSessionLocal() as db:
# # #         result = await db.execute(select(WaterSource))
# # #         sources = result.scalars().all()
        
# # #         for source in sources:
# # #             try:
# # #                 # 1. Fetch data from all APIs
# # #                 sat_data = await fetch_satellite_data(source.latitude, source.longitude)
# # #                 weather_data = await fetch_weather_data(source.latitude, source.longitude)
# # #                 poll_data = await fetch_pollution_data(source.latitude, source.longitude)
                
# # #                 # 2. Store the Water Reading
# # #                 reading = WaterReading(
# # #                     source_id=source.id,
# # #                     ph=7.2, # Seeded baseline
# # #                     turbidity=sat_data.get("turbidity_proxy", 15.0),
# # #                     flood_risk_pct=sat_data.get("flood_index", 0.0) * 100,
# # #                     water_level="Normal",
# # #                     rainfall_mm=weather_data.get("precipitation_sum_24h", 0.0),
# # #                     dissolved_oxygen=8.5,
# # #                     pollution_index=poll_data.get("pollution_index"),
# # #                     ndwi=sat_data.get("ndwi", 0.3),
# # #                     data_source="pipeline",
# # #                     fetched_at=datetime.now(timezone.utc)
# # #                 )
# # #                 db.add(reading)
# # #                 await db.commit()
# # #                 await db.refresh(reading)
                
# # #                 # 3. Trigger Alvin's AI Engine
# # #                 ai_result = await generate_recommendation(reading)
                
# # #                 # 4. Store AI Recommendation
# # #                 ai_rec = AIRecommendation(
# # #                     reading_id=reading.id,
# # #                     source_id=source.id,
# # #                     risk_label=ai_result.get("risk_label", "SAFE"),
# # #                     summary=ai_result.get("summary", "Data updated successfully."),
# # #                     recommendations=ai_result.get("recommendations", []),
# # #                     data_drivers=ai_result.get("data_drivers", []),
# # #                     quality_score=ai_result.get("quality_score", 85),
# # #                     quantity_score=ai_result.get("quantity_score", 85),
# # #                     generated_at=datetime.now(timezone.utc)
# # #                 )
# # #                 db.add(ai_rec)
# # #                 await db.commit()
                
# # #                 logger.info(f"Successfully processed pipeline for {source.name}")
# # #             except Exception as e:
# # #                 logger.error(f"Pipeline failed for {source.name}: {e}")
# # # Alvin's AI service (Importing his interface with a safe hackathon fallback)
# # try:
# #     from app.services.ai_service import generate_recommendation
# # except ImportError:
# #     logger.warning("Alvin's generate_recommendation not found in ai_service.py. Deploying local mock fallback for demo stability.")
    
# #     async def generate_recommendation(reading):
# #         """Temporary mock fallback so the server boots and runs until Alvin merges."""
# #         return {
# #             "risk_label": "SAFE",
# #             "summary": "Satellite and weather data pipeline stable. AI Engine evaluation pending.",
# #             "recommendations": ["Continue routine water quality monitoring.", "Check dashboard for real-time sensor updates."],
# #             "data_drivers": ["Precipitation Baseline", "NDWI Normal"],
# #             "quality_score": 88,
# #             "quantity_score": 85
# #         }
# # def start_scheduler():
# #     scheduler.add_job(fetch_all_data_job, 'interval', hours=36)
# #     scheduler.start()
# #     logger.info("Scheduler started.")

# # def stop_scheduler():
# #     scheduler.shutdown()

# import logging
# from apscheduler.schedulers.asyncio import AsyncIOScheduler
# from sqlalchemy import select
# from datetime import datetime, timezone

# from app.database import AsyncSessionLocal
# from app.models.water_source import WaterSource
# from app.models.water_reading import WaterReading
# from app.models.ai_recommendation import AIRecommendation
# from app.services.ai_service import generate_recommendation, WaterReadingInput

# from app.services.sentinel_service import fetch_satellite_data
# from app.services.weather_service import fetch_weather_data
# from app.services.pollution_service import fetch_pollution_data

# # 1. Initialize core utilities first
# logger = logging.getLogger(__name__)
# scheduler = AsyncIOScheduler()

# # 2. Try importing Alvin's AI service, fallback to a safe mock if empty/missing
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

# # 3. The 36-hour background data pipeline job
# async def fetch_all_data_job():
#     logger.info("Starting 36-hour data fetch cycle...")
#     async with AsyncSessionLocal() as db:
#         result = await db.execute(select(WaterSource))
#         sources = result.scalars().all()
        
#         for source in sources:
#             try:
#                 # 1. Fetch data from all APIs
#                 sat_data = await fetch_satellite_data(source.latitude, source.longitude)
#                 weather_data = await fetch_weather_data(source.latitude, source.longitude)
#                 poll_data = await fetch_pollution_data(source.latitude, source.longitude)
                
#                 # 2. Store the Water Reading
#                 reading = WaterReading(
#                     source_id=source.id,
#                     ph=7.2, # Seeded baseline
#                     turbidity=sat_data.get("turbidity_proxy", 15.0),
#                     flood_risk_pct=sat_data.get("flood_index", 0.0) * 100,
#                     water_level="Normal",
#                     rainfall_mm=weather_data.get("precipitation_sum_24h", 0.0),
#                     dissolved_oxygen=8.5,
#                     pollution_index=poll_data.get("pollution_index"),
#                     ndwi=sat_data.get("ndwi", 0.3),
#                     # data_source="pipeline",
#                      data_source="sentinel_hub",
#                     fetched_at=datetime.now(timezone.utc)
#                 )
#                 db.add(reading)
#                 await db.commit()
#                 await db.refresh(reading)
                
#                 # 3. Trigger AI Engine (safely falls back to mock if Alvin's file is empty)
#                 # Build the typed input first
# reading_input: WaterReadingInput = {
#     "source_id": source.id,
#     "source_name": source.name,
#     "city": source.city,
#     "fetched_at": reading.fetched_at.isoformat(),
#     "ph": reading.ph,
#     "turbidity": reading.turbidity,
#     "flood_risk_pct": reading.flood_risk_pct,
#     "water_level": reading.water_level,
#     "rainfall_mm": reading.rainfall_mm,
#     "dissolved_oxygen": reading.dissolved_oxygen,
#     "pollution_index": reading.pollution_index,
#     "ndwi": reading.ndwi,
# }
# ai_result = await generate_recommendation(reading_input)
                
#                 # 4. Store AI Recommendation
# # ai_rec = AIRecommendation(
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
# ai_result = await generate_recommendation(reading_input)  # returns AIResult

# ai_rec = AIRecommendation(
#     reading_id=reading.id,
#     source_id=source.id,
#     risk_label=ai_result.risk_label,         # ✅ dataclass attribute access
#     summary=ai_result.summary,               # ✅
#     recommendations=ai_result.recommendations, # ✅
#     data_drivers=ai_result.data_drivers,     # ✅
#     quality_score=ai_result.quality_score,   # ✅
#     quantity_score=ai_result.quantity_score, # ✅
#     generated_at=datetime.now(timezone.utc)
# )
# db.add(ai_rec)
#   await db.commit()
                
#                 logger.info(f"Successfully processed pipeline for {source.name}")
#             except Exception as e:
#                 logger.error(f"Pipeline failed for {source.name}: {e}")

# # 4. Lifecycle control hooks for the scheduler
# def start_scheduler():
#     scheduler.add_job(fetch_all_data_job, 'interval', hours=36, id="data_refresh")
#     scheduler.start()
#     logger.info("Scheduler started.")

# def stop_scheduler():
#     scheduler.shutdown()

import asyncio
import logging
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, and_
from datetime import datetime, timezone, timedelta

from app.database import AsyncSessionLocal
from app.models.water_source import WaterSource
from app.models.water_reading import WaterReading
from app.models.ai_recommendation import AIRecommendation
from app.models.alert_log import AlertLog
from app.models.notification_subscription import NotificationSubscription
from app.utils.alert_engine import check_alerts
from app.services.sentinel_service import fetch_satellite_data
from app.services.weather_service import fetch_weather_data
from app.services.pollution_service import fetch_pollution_data

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

ALERT_TITLES = {
    "ph_critical": "WATER ALERT",
    "flood_high": "FLOOD WARNING",
    "water_scarce": "WATER SCARCITY ALERT",
}

ALERT_BODIES = {
    "ph_critical": "pH levels at {name} are outside safe range. Avoid direct use — check AquaSense for details.",
    "flood_high": "High flood risk near {name}. Water quality may be severely impacted. Open AquaSense for safety guidance.",
    "water_scarce": "{name} is showing very low water levels. Plan for alternative water sources.",
}


async def _dispatch_push_notifications(
    db,
    source_id: int,
    source_name: str,
    triggered_types: list[str],
) -> None:
    """For each triggered alert type: throttle-check, write AlertLog, send Expo push."""
    if not triggered_types:
        return

    throttle_cutoff = datetime.now(timezone.utc) - timedelta(hours=6)

    for alert_type in triggered_types:
        # 6-hour throttle: skip if an identical alert was already sent recently
        existing = (await db.execute(
            select(AlertLog).where(
                and_(
                    AlertLog.source_id == source_id,
                    AlertLog.alert_type == alert_type,
                    AlertLog.last_notified_at > throttle_cutoff,
                )
            )
        )).scalar_one_or_none()

        if existing:
            continue

        # Write alert log entry
        log = AlertLog(
            source_id=source_id,
            alert_type=alert_type,
            triggered_at=datetime.now(timezone.utc),
            last_notified_at=datetime.now(timezone.utc),
        )
        db.add(log)
        await db.commit()

        # Find all push tokens subscribed to this source
        subscriptions = (await db.execute(select(NotificationSubscription))).scalars().all()
        tokens = [
            sub.expo_push_token
            for sub in subscriptions
            if source_id in (sub.source_ids or [])
        ]

        if not tokens:
            continue

        body = ALERT_BODIES[alert_type].format(name=source_name)
        messages = [
            {
                "to": token,
                "sound": "default",
                "title": ALERT_TITLES[alert_type],
                "body": body,
                "data": {"source_id": source_id, "alert_type": alert_type},
            }
            for token in tokens
        ]

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(EXPO_PUSH_URL, json=messages)
            logger.info(
                "Sent %d push notification(s) for %s — %s",
                len(tokens), source_name, alert_type,
            )
        except Exception as exc:
            logger.warning("Push dispatch failed for %s/%s: %s", source_name, alert_type, exc)

# 1. Initialize core utilities
logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

# 2. Try importing AI service, fallback to mock if missing
try:
    from app.services.ai_service import generate_recommendation, WaterReadingInput
except ImportError:
    logger.warning("generate_recommendation not found. Using mock fallback.")

    async def generate_recommendation(reading):
        class MockResult:
            risk_label = "SAFE"
            summary = "AI Engine evaluation pending."
            recommendations = ["Continue routine monitoring."]
            data_drivers = ["Precipitation Baseline", "NDWI Normal"]
            quality_score = 88
            quantity_score = 85
        return MockResult()

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
                    ph=7.2,
                    turbidity=sat_data.get("turbidity_proxy", 15.0),
                    flood_risk_pct=sat_data.get("flood_index", 0.0) * 100,
                    water_level="Normal",
                    rainfall_mm=weather_data.get("precipitation_sum_24h", 0.0),
                    dissolved_oxygen=8.5,
                    pollution_index=poll_data.get("pollution_index"),
                    ndwi=sat_data.get("ndwi", 0.3),
                    data_source="sentinel_hub",
                    fetched_at=datetime.now(timezone.utc)
                )
                db.add(reading)
                await db.commit()
                await db.refresh(reading)

                # 3. Build typed input and call AI engine
                reading_input = {
                    "source_id": source.id,
                    "source_name": source.name,
                    "city": source.city,
                    "fetched_at": reading.fetched_at.isoformat(),
                    "ph": reading.ph,
                    "turbidity": reading.turbidity,
                    "flood_risk_pct": reading.flood_risk_pct,
                    "water_level": reading.water_level,
                    "rainfall_mm": reading.rainfall_mm,
                    "dissolved_oxygen": reading.dissolved_oxygen,
                    "pollution_index": reading.pollution_index,
                    "ndwi": reading.ndwi,
                }
                ai_result = await generate_recommendation(reading_input)

                # 4. Store AI Recommendation
                ai_rec = AIRecommendation(
                    reading_id=reading.id,
                    source_id=source.id,
                    risk_label=ai_result.risk_label,
                    summary=ai_result.summary,
                    recommendations=ai_result.recommendations,
                    data_drivers=ai_result.data_drivers,
                    quality_score=ai_result.quality_score,
                    quantity_score=ai_result.quantity_score,
                    generated_at=datetime.now(timezone.utc)
                )
                db.add(ai_rec)
                await db.commit()

                # 5. Check alert thresholds and dispatch push notifications
                triggered = check_alerts(
                    ph=reading.ph,
                    flood_risk_pct=reading.flood_risk_pct,
                    water_level=reading.water_level,
                )
                await _dispatch_push_notifications(db, source.id, source.name, triggered)

                logger.info(f"Successfully processed pipeline for {source.name}")
            except asyncio.CancelledError:
                raise  # server is shutting down / hot-reloading — exit cleanly
            except Exception as e:
                logger.error(f"Pipeline failed for {source.name}: {e}")

# 4. Lifecycle control hooks
def start_scheduler():
    scheduler.add_job(
        fetch_all_data_job,
        "interval",
        hours=36,
        id="data_refresh",
        next_run_time=datetime.now(timezone.utc),  # run immediately on startup
    )
    scheduler.start()
    logger.info("Scheduler started — first data fetch triggered immediately.")

def stop_scheduler():
    scheduler.shutdown()