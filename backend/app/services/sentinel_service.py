# class SentinelService:
#     """Sentinel Hub Process API — NDWI, turbidity proxy, flood index per source bbox."""

#     async def get_water_data(self, lat: float, lng: float) -> dict:
#         # TODO: Alvin
#         # 1. OAuth2 client_credentials → bearer token (CLIENT_ID + CLIENT_SECRET)
#         # 2. POST /api/v1/process with evalscript: bands B3, B4, B8, B11, B12
#         # 3. Return {"ndwi": float, "turbidity_proxy": float, "flood_index": float}
#         # Retry 3x, hard timeout 10s, token cached until expiry
#         raise NotImplementedError


import httpx
import logging
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# In-memory token cache to avoid requesting a new token on every call
_sentinel_token = None
_token_expiry = None

async def get_sentinel_token() -> str:
    """Authenticates with Sentinel Hub via OAuth2."""
    global _sentinel_token, _token_expiry
    
    # Return cached token if still valid
    if _sentinel_token and _token_expiry and datetime.now() < _token_expiry:
        return _sentinel_token

    client_id = os.getenv("SENTINEL_CLIENT_ID")
    client_secret = os.getenv("SENTINEL_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise ValueError("Sentinel credentials missing in .env")

    url = "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, data=data)
        resp.raise_for_status()
        token_data = resp.json()
        
        _sentinel_token = token_data["access_token"]
        # Buffer expiry by 60 seconds for safety
        _token_expiry = datetime.now() + timedelta(seconds=token_data["expires_in"] - 60)
        
        return _sentinel_token

async def fetch_satellite_data(lat: float, lng: float) -> dict:
    """
    Fetches band stats (B3, B4, B8, B11, B12) from Sentinel Hub.
    Falls back to seeded data on any failure to protect the demo.
    """
    try:
        token = await get_sentinel_token()
        url = "https://services.sentinel-hub.com/api/v1/statistics"
        headers = {
            "Authorization": f"Bearer {token}", 
            "Content-Type": "application/json"
        }
        
        # Note: The actual Evalscript JSON payload would be constructed here
        # using the bounding box generated from lat/lng. 
        # For the hackathon, if the payload isn't fully configured from your 
        # MOSES_SATELLITE_HANDOFF.md, we log the attempt and drop into the fallback.
        
        # Uncomment and implement when evalscript payload is ready:
        # resp = await client.post(url, headers=headers, json=payload)
        # resp.raise_for_status()
        # return parse_sentinel_response(resp.json())
        
        raise NotImplementedError("Evalscript payload not yet injected.")

    except Exception as e:
        logger.warning(f"Sentinel API fallback triggered for {lat},{lng}: {str(e)}")
        # Bulletproof demo fallback data
        return {
            "ndwi": 0.42,              # Healthy water index
            "turbidity_proxy": 14.5,   # Estimated NTU
            "water_extent_score": 0.88,# Normal volume
            "flood_index": 0.12,       # Low flood risk
            "status": "fallback"
        }