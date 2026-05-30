from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Groq AI — matches .env keys GROQ_API_KEY_1 / GROQ_API_KEY_2
    groq_api_key_1: str = ""
    groq_api_key_2: str = ""

    # Sentinel Hub — matches .env keys SENTINEL_CLIENT_ID / SENTINEL_CLIENT_SECRET
    sentinel_client_id: str = ""
    sentinel_client_secret: str = ""

    # OpenAQ — matches .env key OPENAQ_API_KEY
    openaq_api_key: str = ""

    # Admin key — matches .env key INTERNAL_API_KEY
    internal_api_key: str = "dev-admin-key"

    # Database — matches .env key DATABASE_URL
    database_url: str = "sqlite+aiosqlite:///./aquasense.db"

    debug: bool = True
    port: int = 8000

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }


settings = Settings()
