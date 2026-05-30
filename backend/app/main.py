import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import httpx
from groq import Groq, AuthenticationError, APIConnectionError, RateLimitError

from app.config import settings
from app.database import engine, Base
from app.routers import sources, alerts, notifications
from app.services.scheduler import start_scheduler, stop_scheduler
from app.services.sentinel_service import get_sentinel_token

import app.models.water_source       # noqa: F401
import app.models.water_reading      # noqa: F401
import app.models.ai_recommendation  # noqa: F401
import app.models.alert_log          # noqa: F401

logger = logging.getLogger(__name__)


async def _probe_groq() -> str:
    """Live probe: attempt a real 1-token completion to verify the key works."""
    failures: list[str] = []

    for label, key in [("key_1", settings.groq_api_key_1), ("key_2", settings.groq_api_key_2)]:
        if not key:
            failures.append(f"{label}: not set")
            continue
        try:
            client = Groq(api_key=key)
            await asyncio.to_thread(
                client.chat.completions.create,
                model=settings.groq_model_primary,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
            )
            logger.info("Groq live probe OK using %s", label)
            return f"reachable ({label} authenticated)"
        except AuthenticationError as exc:
            detail = str(exc)
            logger.warning("Groq %s: authentication failed — %s", label, detail)
            failures.append(f"{label}: invalid key — {detail}")
        except RateLimitError:
            # Rate-limited means the key IS valid — the API accepted it
            logger.info("Groq %s: rate limited but key is valid", label)
            return f"reachable ({label} valid — rate limited)"
        except APIConnectionError as exc:
            logger.warning("Groq %s: network unreachable — %s", label, exc)
            failures.append(f"{label}: network error — {exc}")
        except Exception as exc:
            logger.warning("Groq %s: unexpected error — %s", label, exc)
            failures.append(f"{label}: unexpected — {exc}")

    if not settings.groq_api_key_1 and not settings.groq_api_key_2:
        return "MISSING — set GROQ_API_KEY_1 in .env"
    return "FAILED — " + " | ".join(failures)


async def _probe_sentinel() -> str:
    """Live probe: attempt a real OAuth2 token fetch to verify credentials work."""
    if not settings.sentinel_client_id or not settings.sentinel_client_secret:
        return "MISSING — set SENTINEL_CLIENT_ID/SECRET in .env"
    try:
        token = await get_sentinel_token()
        if token:
            logger.info("Sentinel Hub live probe OK — token acquired")
            return "reachable — OAuth2 token acquired"
        return "FAILED — token fetch returned empty"
    except ValueError as exc:
        return f"MISSING credentials — {exc}"
    except httpx.HTTPStatusError as exc:
        body = exc.response.text[:300]
        if exc.response.status_code == 401:
            return (
                "FAILED — 401 Unauthorized. Your SENTINEL_CLIENT_ID/SECRET are rejected by "
                "Copernicus Data Space. Old sentinel-hub.com credentials do NOT work here — "
                "create new OAuth2 credentials at: dataspace.copernicus.eu → Dashboard → "
                f"User Settings → OAuth clients. Raw error: {body}"
            )
        return f"FAILED — HTTP {exc.response.status_code} from token endpoint: {body}"
    except httpx.ConnectError as exc:
        return f"unreachable — could not connect to token endpoint ({exc})"
    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logger.warning("Sentinel Hub probe failed: %s", exc)
        return f"FAILED — {type(exc).__name__}: {exc}"


async def _check_external_apis() -> dict:
    """Live-probe all external APIs at startup. Non-blocking — failures are warnings only."""
    results = {}

    # Run all four probes concurrently so startup isn't delayed by sequential timeouts
    groq_result, sentinel_result, open_meteo_resp, openaq_resp = await asyncio.gather(
        _probe_groq(),
        _probe_sentinel(),
        _probe_open_meteo(),
        _probe_openaq(),
        return_exceptions=True,
    )

    results["groq"] = groq_result if isinstance(groq_result, str) else f"error — {groq_result}"
    results["sentinel_hub"] = sentinel_result if isinstance(sentinel_result, str) else f"error — {sentinel_result}"
    results["open_meteo"] = open_meteo_resp if isinstance(open_meteo_resp, str) else f"error — {open_meteo_resp}"
    results["openaq"] = openaq_resp if isinstance(openaq_resp, str) else f"error — {openaq_resp}"

    logger.info("External API health check: %s", results)

    groq_ok = "reachable" in results["groq"]
    sentinel_ok = "reachable" in results["sentinel_hub"]
    open_meteo_ok = results["open_meteo"] == "reachable"

    if groq_ok and sentinel_ok:
        logger.info("✅ All critical external APIs live and responding — backend ready")
    else:
        failed = []
        if not groq_ok:
            failed.append(f"groq ({results['groq']})")
        if not sentinel_ok:
            failed.append(f"sentinel_hub ({results['sentinel_hub'][:120]})")
        logger.warning("⚠️  Critical API(s) unavailable: %s", " | ".join(failed))

    if not open_meteo_ok:
        logger.warning("⚠️  Open-Meteo unavailable — weather data will use fallback: %s", results["open_meteo"])
    else:
        logger.info("✅ Open-Meteo reachable — live weather data enabled")

    if groq_ok:
        logger.info("✅ Groq reachable — AI recommendations enabled")

    return results


async def _probe_open_meteo() -> str:
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                settings.open_meteo_base_url,
                params={"latitude": -1.29, "longitude": 36.82, "hourly": "precipitation", "forecast_days": 1},
            )
        if resp.status_code == 200:
            return "reachable"
        return f"HTTP {resp.status_code} — {resp.text[:200]}"
    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logger.warning("Open-Meteo unreachable at startup: %s", exc)
        return f"unreachable — {exc}"


async def _probe_openaq() -> str:
    if not settings.openaq_api_key:
        return "not configured (optional)"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                f"{settings.openaq_base_url}v3/locations",
                params={"coordinates": "-1.29,36.82", "radius": 10000, "limit": 1},
                headers={"X-API-Key": settings.openaq_api_key},
            )
        if resp.status_code == 200:
            return "reachable"
        return f"HTTP {resp.status_code} — {resp.text[:200]}"
    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logger.warning("OpenAQ unreachable at startup: %s", exc)
        return f"unreachable — {exc}"


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
