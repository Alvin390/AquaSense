class SentinelService:
    """Sentinel Hub Process API — NDWI, turbidity proxy, flood index per source bbox."""

    async def get_water_data(self, lat: float, lng: float) -> dict:
        # TODO: Alvin
        # 1. OAuth2 client_credentials → bearer token (CLIENT_ID + CLIENT_SECRET)
        # 2. POST /api/v1/process with evalscript: bands B3, B4, B8, B11, B12
        # 3. Return {"ndwi": float, "turbidity_proxy": float, "flood_index": float}
        # Retry 3x, hard timeout 10s, token cached until expiry
        raise NotImplementedError
