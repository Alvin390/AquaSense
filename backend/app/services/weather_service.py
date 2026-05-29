# WeatherService — Open-Meteo API integration (free, no key required)
# Base URL: https://api.open-meteo.com/v1/forecast
# Fetches: precipitation (hourly), precipitation_sum (daily 7d),
#          river_discharge (GloFAS), temperature_2m
# Derives flood_score from precipitation + river discharge threshold
