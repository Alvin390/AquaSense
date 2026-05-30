import math
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.alert_log import AlertLog
from app.models.water_source import WaterSource
from app.models.water_reading import WaterReading
from app.schemas import AlertResponse
from app.utils.alert_engine import check_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points on the Earth's surface
    in kilometers using the Haversine formula.
    """
    earth_radius_km = 6371.0

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    haversine_value = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(delta_lon / 2) ** 2
    )
    central_angle = 2 * math.atan2(math.sqrt(haversine_value), math.sqrt(1 - haversine_value))

    return earth_radius_km * central_angle


@router.get("/active", response_model=list[AlertResponse])
async def get_active_alerts(
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch all water sources to compute radial distances
    sources_query = select(WaterSource)
    sources_result = await db.execute(sources_query)
    all_sources = sources_result.scalars().all()

    # Filter sources using the Haversine utility function
    nearby_sources = [
        source for source in all_sources
        if calculate_haversine(lat, lng, source.latitude, source.longitude) <= radius_km
    ]

    active_alerts_output = []
    throttle_window_start = datetime.utcnow() - timedelta(hours=6)

    # 2. Iterate through nearby sources to discover and evaluate the latest readings
    for source in nearby_sources:
        reading_query = (
            select(WaterReading)
            .where(WaterReading.source_id == source.id)
            .order_by(desc(WaterReading.timestamp))
            .limit(1)
        )
        reading_result = await db.execute(reading_query)
        latest_reading = reading_result.scalar_one_or_none()

        if not latest_reading:
            continue

        # 3. Call Alvin's evaluation engine (do not modify its underlying code)
        triggered_alert_types = check_alerts(
            ph=latest_reading.ph,
            flood_risk_pct=latest_reading.flood_risk_pct,
            water_level=latest_reading.water_level
        )

        # 4. Process each triggered alert type against the 6-hour throttle rule
        for alert_type in triggered_alert_types:
            throttle_query = select(AlertLog).where(
                and_(
                    AlertLog.source_id == source.id,
                    AlertLog.alert_type == alert_type,
                    AlertLog.last_notified_at > throttle_window_start
                )
            )
            throttle_result = await db.execute(throttle_query)
            existing_active_alert = throttle_result.scalar_one_or_none()

            # If an identical alert was sent within 6 hours, suppress it
            if existing_active_alert:
                continue

            # 5. If throttle check passes, write a new log row to the database
            new_alert_log = AlertLog(
                source_id=source.id,
                alert_type=alert_type,
                triggered_at=datetime.utcnow(),
                last_notified_at=datetime.utcnow()
            )
            db.add(new_alert_log)
            await db.commit()
            await db.refresh(new_alert_log)

            # 6. Append to the final payload returned to the frontend client
            active_alerts_output.append({
                "source_id": source.id,
                "source_name": source.name,
                "alert_type": alert_type,
                "triggered_at": new_alert_log.triggered_at
            })

    return active_alerts_output
