class PollutionService:
    """OpenAQ API — air quality near source as pollution proxy for AI prompt context."""

    async def get_pollution(self, lat: float, lng: float) -> float | None:
        # TODO: Alvin
        # GET https://api.openaq.org/v3/locations nearest to lat/lng
        # Composite PM2.5 + NO2 index → float (0–100) or None if API unavailable
        # None is valid — AI prompt flags as "pollution data unknown"
        raise NotImplementedError
