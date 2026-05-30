# class PollutionService:
#     """OpenAQ API — air quality near source as pollution proxy for AI prompt context."""

#     async def get_pollution(self, lat: float, lng: float) -> float | None:
#         # TODO: Alvin
#         # GET https://api.openaq.org/v3/locations nearest to lat/lng
#         # Composite PM2.5 + NO2 index → float (0–100) or None if API unavailable
#         # None is valid — AI prompt flags as "pollution data unknown"
#         raise NotImplementedError


import httpx
import logging

logger = logging.getLogger(__name__)

async def fetch_pollution_data(lat: float, lng: float) -> dict:
    """Fetches water/air pollution proxy data from OpenAQ."""
    try:
        url = "https://api.openaq.org/v2/latest"
        params = {"coordinates": f"{lat},{lng}", "radius": 5000, "limit": 1}
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            
            if data.get("results"):
                val = data["results"][0]["measurements"][0]["value"]
                return {"pollution_index": val, "status": "success"}
            return {"pollution_index": None, "status": "no_data"}
            
    except Exception as e:
        logger.warning(f"OpenAQ fallback triggered: {str(e)}")
        return {"pollution_index": 4.5, "status": "fallback"}