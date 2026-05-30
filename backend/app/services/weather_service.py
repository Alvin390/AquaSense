import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)

async def fetch_weather_data(lat: float, lng: float) -> dict:
    """
    Fetches real-time weather and river discharge from Open-Meteo.
    No API key required.
    """
    weather_url = "https://api.open-meteo.com/v1/forecast"
    flood_url = "https://flood-api.open-meteo.com/v1/flood"

    weather_params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,precipitation",
        "daily": "precipitation_sum",
        "timezone": "Africa/Nairobi"
    }

    flood_params = {
        "latitude": lat,
        "longitude": lng,
        "daily": "river_discharge",
        "timezone": "Africa/Nairobi"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fetch both weather and flood data in parallel
            weather_task = client.get(weather_url, params=weather_params)
            flood_task = client.get(flood_url, params=flood_params)

            weather_resp, flood_resp = await asyncio.gather(weather_task, flood_task)

            weather_resp.raise_for_status()
            w_data = weather_resp.json()

            current = w_data.get("current", {})
            daily_w = w_data.get("daily", {})
            precip_sum = daily_w.get("precipitation_sum", [0.0])[0]

            river_discharge = 0.0
            if flood_resp.status_code == 200:
                f_data = flood_resp.json()
                river_discharge_list = f_data.get("daily", {}).get("river_discharge", [])
                river_discharge = river_discharge_list[0] if river_discharge_list else 0.0

            return {
                "temperature_2m": current.get("temperature_2m", 20.0),
                "precipitation_mm_hr": current.get("precipitation", 0.0),
                "precipitation_sum_24h": precip_sum,
                "river_discharge": river_discharge,
                "status": "success"
            }

    except Exception as e:
        logger.error(f"Open-Meteo API failed for {lat},{lng}: {str(e)}")
        # Safe fallback for the demo if network drops
        return {
            "temperature_2m": 22.5,
            "precipitation_mm_hr": 0.0,
            "precipitation_sum_24h": 12.5,
            "river_discharge": 1.5,
            "status": "fallback"
        }