from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    sentinel_hub_client_id: str = ""
    sentinel_hub_client_secret: str = ""
    groq_api_key_1: str = ""
    groq_api_key_2: str = ""
    openaq_api_key: str = ""
    admin_api_key: str = "dev-admin-key"
    database_url: str = "sqlite+aiosqlite:///./aquasense.db"
    debug: bool = True
    port: int = 8000

    model_config = {"env_file": ".env"}


settings = Settings()
