import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import httpx

from app.config import settings
from app.database import engine, Base
from app.routers import sources, alerts, notifications
from app.services.scheduler import start_scheduler, stop_scheduler

import app.models.water_source       # noqa: F401
import app.models.water_reading      # noqa: F401
import app.models.ai_recommendation  # noqa: F401
import app.models.alert_log          # noqa: F401

logger = logging.getLogger(__name__)


async def _check_external_apis() -> dict:
    """Probe all external APIs at startup and log results.
    Returns a status dict — non-blocking; failures are warnings only."""
    results = {}

    # Groq API — validate at least one key is set
    groq_ok = bool(settings.groq_api_key_1 or settings.groq_api_key_2)
    results["groq"] = "configured" if groq_ok else "MISSING — set GROQ_API_KEY_1 in .env"
    if not groq_ok:
        logger.warning("Groq API key(s) not set — AI recommendations will use seeded fallback")

    # Sentinel Hub — check credentials are set
    sentinel_ok = bool(settings.sentinel_hub_client_id and settings.sentinel_hub_client_secret)
    results["sentinel_hub"] = "configured" if sentinel_ok else "MISSING — set SENTINEL_HUB_CLIENT_ID/SECRET in .env"
    if not sentinel_ok:
        logger.warning("Sentinel Hub credentials missing — satellite data will use seeded fallback")

    # Open-Meteo — free API, no key required; do a live probe
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={"latitude": -1.29, "longitude": 36.82, "hourly": "precipitation", "forecast_days": 1},
            )
        results["open_meteo"] = "reachable" if resp.status_code == 200 else f"HTTP {resp.status_code}"
    except Exception as exc:
        results["open_meteo"] = f"unreachable ({exc})"
        logger.warning("Open-Meteo unreachable at startup: %s", exc)

    # OpenAQ — optional, probe quickly
    openaq_key = settings.openaq_api_key
    if openaq_key:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(
                    "https://api.openaq.org/v2/latest",
                    params={"limit": 1},
                    headers={"X-API-Key": openaq_key},
                )
            results["openaq"] = "reachable" if resp.status_code == 200 else f"HTTP {resp.status_code}"
        except Exception as exc:
            results["openaq"] = f"unreachable ({exc})"
            logger.warning("OpenAQ unreachable at startup: %s", exc)
    else:
        results["openaq"] = "not configured (optional)"

    # Log summary
    logger.info("External API health check: %s", results)
    all_critical_ok = groq_ok and sentinel_ok
    if all_critical_ok:
        logger.info("✅ All critical external APIs configured — backend ready")
    else:
        logger.warning("⚠️  Some critical APIs not configured — demo will fall back to seeded data")

    return results


_startup_api_health: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _startup_api_health
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    _startup_api_health = await _check_external_apis()
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="AquaSense API",
    version="0.1.0",
    docs_url="/docs",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sources.router)
app.include_router(alerts.router)
app.include_router(notifications.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "aquasense",
        "external_apis": _startup_api_health,
    }
