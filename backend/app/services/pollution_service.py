import httpx
import logging

logger = logging.getLogger(__name__)


async def get_pollution_context(lat: float, lng: float) -> str:
    """
    Fetches air/pollution proxy data from OpenAQ near the given coordinates
    and formats it into a clean contextual string for the AI prompt engine.
    
    Falls back gracefully to a standard string if the API is down or data is missing.
    """
    url = "https://api.openaq.org/v2/latest"
    # OpenAQ v2 expects coordinates formatted as "lat,lng" string
    params = {
        "coordinates": f"{lat},{lng}",
        "radius": 10000,  # Expand to 10km radius for better coverage in Nairobi outskirts
        "limit": 5
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
        results = data.get("results")
        if not results:
            logger.info(f"No OpenAQ sensor data found within radius for coordinates: {lat}, {lng}")
            return "Pollution data unavailable."
            
        # Extract and compile a text summary of the closest measurements
        context_parts = []
        first_location = results[0]
        location_name = first_location.get("location", "Unknown Station")
        
        context_parts.append(f"Air quality data from nearest monitoring station ({location_name}):")
        
        for measurement in first_location.get("measurements", []):
            parameter = measurement.get("parameter", "unknown").upper()
            value = measurement.get("value")
            unit = measurement.get("unit", "")
            if value is not None:
                context_parts.append(f"- {parameter}: {value} {unit}")
                
        # Join into a clean paragraph block for Moses to append to the prompt context
        return " ".join(context_parts)
        
    except httpx.HTTPError as http_err:
        logger.warning(f"OpenAQ API connection issue: {str(http_err)}")
        return "Pollution data unavailable."
    except Exception as e:
        logger.error(f"Unexpected error in pollution service: {str(e)}", exc_info=True)
        return "Pollution data unavailable."