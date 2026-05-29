class WeatherService:
    """Open-Meteo API — precipitation, river discharge, temperature (no API key)."""

    async def get_weather(self, lat: float, lng: float) -> dict:
        # TODO: Moses
        # GET https://api.open-meteo.com/v1/forecast
        # params: latitude, longitude, hourly=precipitation, daily=precipitation_sum,
        #         river_discharge (GloFAS), temperature_2m
        # Return {"rainfall_mm": float, "river_discharge": float, "flood_score": float}
        raise NotImplementedError
