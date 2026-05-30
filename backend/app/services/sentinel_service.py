# class SentinelService:
#     """Sentinel Hub Process API — NDWI, turbidity proxy, flood index per source bbox."""

#     async def get_water_data(self, lat: float, lng: float) -> dict:
#         # TODO: Alvin
#         # 1. OAuth2 client_credentials → bearer token (CLIENT_ID + CLIENT_SECRET)
#         # 2. POST /api/v1/process with evalscript: bands B3, B4, B8, B11, B12
#         # 3. Return {"ndwi": float, "turbidity_proxy": float, "flood_index": float}
#         # Retry 3x, hard timeout 10s, token cached until expiry
#         raise NotImplementedError


import asyncio
import httpx
import logging
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# In-memory token cache to avoid requesting a new token on every call
_sentinel_token = None
_token_expiry = None

async def get_sentinel_token() -> str:
    """Authenticates with Sentinel Hub (Copernicus Data Space) via OAuth2."""
    global _sentinel_token, _token_expiry

    if _sentinel_token and _token_expiry and datetime.now() < _token_expiry:
        return _sentinel_token

    from app.config import settings
    client_id = settings.sentinel_client_id
    client_secret = settings.sentinel_client_secret

    if not client_id or not client_secret:
        raise ValueError("Sentinel credentials missing in .env")

    url = settings.sentinel_token_url
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, data=data)
        resp.raise_for_status()
        token_data = resp.json()
        
        _sentinel_token = token_data["access_token"]
        # Buffer expiry by 60 seconds for safety
        _token_expiry = datetime.now() + timedelta(seconds=token_data["expires_in"] - 60)
        
        return _sentinel_token

from app.utils.water_math import ndwi, turbidity_proxy, flood_index

async def fetch_satellite_data(lat: float, lng: float) -> dict:
    """
    Fetches band stats (B3, B4, B8, B11) from Sentinel Hub (Copernicus Data Space).
    Falls back to seeded data on any failure to protect the demo.
    """
    from app.config import settings
    try:
        token = await get_sentinel_token()
        url = f"{settings.sentinel_base_url}/api/v1/statistics"
        headers = {
            "Authorization": f"Bearer {token}", 
            "Content-Type": "application/json"
        }
        
        # Define a small 500m bounding box around the point
        offset = 0.005 
        bbox = [lng - offset, lat - offset, lng + offset, lat + offset]

        # Standard Statistics API payload for Sentinel-2
        payload = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": {"crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"}
                },
                "data": [{
                    "type": "S2L2A",
                    "dataFilter": {"mosaickingOrder": "mostRecent"}
                }]
            },
            "aggregation": {
                "timeRange": {
                    "from": (datetime.now() - timedelta(days=30)).isoformat() + "Z",
                    "to": datetime.now().isoformat() + "Z"
                },
                "aggregationInterval": {"of": "P30D"},
                "evalscript": """
                    //VERSION=3
                    function setup() {
                      return {
                        input: [{
                          bands: ["B03", "B04", "B08", "B11"],
                          units: "REFLECTANCE"
                        }],
                        output: [
                          { id: "default", bands: 4 }
                        ]
                      };
                    }
                    function evaluatePixel(samples) {
                      return [samples.B03, samples.B04, samples.B08, samples.B11];
                    }
                """,
                "resx": 10,
                "resy": 10
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            # We wrap this in a try-except to handle cases where the user 
            # hasn't provided a valid SENTINEL_CLIENT_ID yet.
            try:
                resp = await client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                stats_data = resp.json()
                return parse_sentinel_response(stats_data)
            except Exception as api_err:
                logger.warning(f"Sentinel API call failed: {api_err}. Using fallback.")
                raise api_err

    except asyncio.CancelledError:
        raise  # never swallow task cancellations — let them propagate cleanly
    except Exception as e:
        if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 401:
            logger.warning(
                "Sentinel Hub 401 for %s,%s — credentials rejected by Copernicus Data Space. "
                "Create new OAuth2 credentials at dataspace.copernicus.eu → Dashboard → "
                "User Settings → OAuth clients (old sentinel-hub.com keys do not work here).",
                lat, lng,
            )
        else:
            logger.warning("Sentinel API fallback triggered for %s,%s: %s", lat, lng, e)
        return {
            "ndwi": 0.42,              
            "turbidity_proxy": 14.5,   
            "water_extent_score": 0.88,
            "flood_index": 0.12,       
            "status": "fallback"
        }

def parse_sentinel_response(data: dict) -> dict:
    """Parses Statistics API output into meaningful water indices.

    The evalscript returns [B03, B04, B08, B11] in order, so the Statistics API
    labels them B0, B1, B2, B3 (zero-indexed) — NOT the original band names.
    """
    try:
        outputs = data['data'][0]['outputs']['default']['bands']
        b3 = outputs['B0']['stats']['mean']   # evalscript position 0 = B03 (Green)
        b4 = outputs['B1']['stats']['mean']   # evalscript position 1 = B04 (Red)
        b8 = outputs['B2']['stats']['mean']   # evalscript position 2 = B08 (NIR)
        b11 = outputs['B3']['stats']['mean']  # evalscript position 3 = B11 (SWIR)

        ndwi_val = ndwi(b3, b8)
        turb = turbidity_proxy(b4, b3)
        flood = flood_index(ndwi_val, b11)

        return {
            "ndwi": round(ndwi_val, 4),
            "turbidity_proxy": turb,
            "flood_index": flood,
            "water_extent_score": round(1 - flood, 2), # Simplified inverse of flood
            "status": "success"
        }
    except (KeyError, IndexError, TypeError) as e:
        logger.error(f"Failed to parse Sentinel response: {e}")
        raise ValueError("Invalid Sentinel response format")