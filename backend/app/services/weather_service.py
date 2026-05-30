# class WeatherService:
#     """Open-Meteo API — precipitation, river discharge, temperature (no API key)."""

#     async def get_weather(self, lat: float, lng: float) -> dict:
#         # TODO: Moses
#         # GET https://api.open-meteo.com/v1/forecast
#         # params: latitude, longitude, hourly=precipitation, daily=precipitation_sum,
#         #         river_discharge (GloFAS), temperature_2m
#         # Return {"rainfall_mm": float, "river_discharge": float, "flood_score": float}
#         raise NotImplementedError

import httpx
import logging

logger = logging.getLogger(__name__)

async def fetch_weather_data(lat: float, lng: float) -> dict:
    """
    Fetches real-time weather and river data from Open-Meteo.
    No API key required.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,precipitation",
        "daily": "precipitation_sum",
        "timezone": "Africa/Nairobi"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            current = data.get("current", {})
            daily = data.get("daily", {})
            
            # Get today's total precipitation safely
            precip_sum_list = daily.get("precipitation_sum", [])
            precip_sum = precip_sum_list[0] if precip_sum_list else 0.0

            return {
                "temperature_2m": current.get("temperature_2m", 20.0),
                "precipitation_mm_hr": current.get("precipitation", 0.0),
                "precipitation_sum_24h": precip_sum,
                "status": "success"
            }

    except Exception as e:
        logger.error(f"Open-Meteo API failed for {lat},{lng}: {str(e)}")
        # Safe fallback for the demo if network drops
        return {
            "temperature_2m": 22.5,
            "precipitation_mm_hr": 0.0,
            "precipitation_sum_24h": 12.5,
            "status": "fallback"
        }