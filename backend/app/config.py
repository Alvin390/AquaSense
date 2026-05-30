from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Groq AI
    groq_api_key_1: str = ""
    groq_api_key_2: str = ""
    groq_model_primary: str = "llama-3.3-70b-versatile"
    groq_model_fallback: str = "llama-3.1-8b-instant"

    # Sentinel Hub (Copernicus Data Space)
    sentinel_client_id: str = ""
    sentinel_client_secret: str = ""
    sentinel_base_url: str = "https://sh.dataspace.copernicus.eu"
    sentinel_token_url: str = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"

    # Open-Meteo (no key required)
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast"

    # OpenAQ
    openaq_base_url: str = "https://api.openaq.org/"
    openaq_api_key: str = ""

    # Internal
    internal_api_key: str = "dev-admin-key"
    database_url: str = "sqlite+aiosqlite:///./aquasense.db"
    backend_url: str = "http://localhost:8000"

    debug: bool = True
    port: int = 8000

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }


settings = Settings()
