from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.database import engine, Base
from app.routers import sources, alerts, notifications
from app.services.scheduler import start_scheduler, stop_scheduler

# Import models so SQLAlchemy registers them with Base before create_all
import app.models.water_source       # noqa: F401
import app.models.water_reading      # noqa: F401
import app.models.ai_recommendation  # noqa: F401
import app.models.alert_log          # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
# app.include_router(sources.router) # added onn

@app.get("/health")
async def health():
    return {"status": "ok", "service": "aquasense"}
