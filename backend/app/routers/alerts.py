from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/active", response_model=list[AlertResponse])
async def get_active_alerts(
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float = 10.0,
    db: AsyncSession = Depends(get_db),
):
    # TODO: Moses — query AlertLog for active alerts near lat/lng within radius_km
    return []
