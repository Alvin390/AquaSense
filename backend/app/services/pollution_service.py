import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)


async def fetch_pollution_data(lat: float, lng: float) -> dict:
    """Returns a numeric pollution index derived from OpenAQ air quality data."""
    context = await get_pollution_context(lat, lng)
    if "unavailable" in context:
        return {"pollution_index": 25.0}
    param_count = context.count("- ")
    index = 10.0 + (param_count * 5.0)
    return {"pollution_index": min(index, 100.0)}


async def get_pollution_context(lat: float, lng: float) -> str:
    """
    Fetches air quality data from OpenAQ v3 near the given coordinates.
    Two-step: find nearest location, then fetch its latest measurements.
    Falls back gracefully if the API is down or returns no data.
    """
    from app.config import settings
    headers = {}
    if settings.openaq_api_key:
        headers["X-API-Key"] = settings.openaq_api_key

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # Step 1 — find the nearest monitoring station
            loc_resp = await client.get(
                "https://api.openaq.org/v3/locations",
                params={"coordinates": f"{lat},{lng}", "radius": 10000, "limit": 1},
                headers=headers,
            )
            loc_resp.raise_for_status()
            locations = loc_resp.json().get("results", [])

            if not locations:
                logger.info("No OpenAQ v3 station within 10km of %s,%s", lat, lng)
                return "Pollution data unavailable."

            location = locations[0]
            location_id = location["id"]
            location_name = location.get("name", "Unknown Station")

            # Step 2 — get latest measurements for that station
            meas_resp = await client.get(
                f"https://api.openaq.org/v3/locations/{location_id}/latest",
                headers=headers,
            )
            meas_resp.raise_for_status()
            measurements = meas_resp.json().get("results", [])

            if not measurements:
                return f"Air quality station found ({location_name}) but no recent measurements available."

            context_parts = [f"Air quality data from nearest monitoring station ({location_name}):"]
            for m in measurements:
                param = m.get("parameter", {})
                name = param.get("name", "unknown").upper()
                value = m.get("value")
                units = param.get("units", "")
                if value is not None:
                    context_parts.append(f"- {name}: {value} {units}")

            return " ".join(context_parts)

    except asyncio.CancelledError:
        raise
    except httpx.HTTPError as exc:
        logger.warning("OpenAQ API error: %s", exc)
        return "Pollution data unavailable."
    except Exception as exc:
        logger.error("Unexpected error in pollution service: %s", exc, exc_info=True)
        return "Pollution data unavailable."
