from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import SourceListResponse, HistoryResponse

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("/", response_model=SourceListResponse)
async def list_sources(city: str | None = None, db: AsyncSession = Depends(get_db)):
    # TODO: Moses — query water_sources, optional filter by city or lat/lng/radius
    return SourceListResponse(sources=[], count=0)


@router.get("/{source_id}/latest")
async def get_latest_reading(source_id: int, db: AsyncSession = Depends(get_db)):
    # TODO: Moses — return latest WaterReading + AIRecommendation for source
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{source_id}/history", response_model=HistoryResponse)
async def get_source_history(source_id: int, days: int = 7, db: AsyncSession = Depends(get_db)):
    # TODO: Moses — fetch readings for past N days
    return HistoryResponse(source_id=source_id, readings=[])


@router.post("/{source_id}/refresh")
async def refresh_source(
    source_id: int,
    x_api_key: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
):
    # TODO: Alvin — validate admin key against settings.admin_api_key, trigger fetch
    raise HTTPException(status_code=501, detail="Not implemented yet")
