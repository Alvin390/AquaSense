# from fastapi import APIRouter, Depends, HTTPException, Header
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.database import get_db
# from app.schemas import SourceListResponse, HistoryResponse

# router = APIRouter(prefix="/sources", tags=["sources"])


# @router.get("/", response_model=SourceListResponse)
# async def list_sources(city: str | None = None, db: AsyncSession = Depends(get_db)):
#     # TODO: Moses — query water_sources, optional filter by city or lat/lng/radius
#     return SourceListResponse(sources=[], count=0)


# @router.get("/{source_id}/latest")
# async def get_latest_reading(source_id: int, db: AsyncSession = Depends(get_db)):
#     # TODO: Moses — return latest WaterReading + AIRecommendation for source
#     raise HTTPException(status_code=501, detail="Not implemented yet")


# @router.get("/{source_id}/history", response_model=HistoryResponse)
# async def get_source_history(source_id: int, days: int = 7, db: AsyncSession = Depends(get_db)):
#     # TODO: Moses — fetch readings for past N days
#     return HistoryResponse(source_id=source_id, readings=[])


# @router.post("/{source_id}/refresh")
# async def refresh_source(
#     source_id: int,
#     x_api_key: str = Header(default=""),
#     db: AsyncSession = Depends(get_db),
# ):
#     # TODO: Alvin — validate admin key against settings.admin_api_key, trigger fetch
#     raise HTTPException(status_code=501, detail="Not implemented yet")


from fastapi import APIRouter, Depends, HTTPException, Security, Query
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
import os

from app.database import get_db
from app.models.water_source import WaterSource
from app.models.water_reading import WaterReading
from app.models.ai_recommendation import AIRecommendation
from app.schemas import (
    SourceListResponse, SourceListElement,
    SourceDetailResponse, SourceDetailResponseData,
    SourceHistoryResponse
)

router = APIRouter(prefix="/sources", tags=["Sources"])
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    expected_key = os.getenv("ADMIN_API_KEY", "dev-admin-key")
    if api_key != expected_key:
        raise HTTPException(status_code=401, detail={"error": True, "code": "UNAUTHORIZED", "message": "Invalid API Key"})
    return api_key

@router.get("", response_model=SourceListResponse)
async def get_sources(
    city: str = Query(None), 
    lat: float = Query(None), 
    lng: float = Query(None), 
    radius_km: float = Query(None), 
    db: AsyncSession = Depends(get_db)
):
    query = select(WaterSource)
    if city:
        query = query.where(WaterSource.city == city)
    
    result = await db.execute(query)
    sources = result.scalars().all()
    
    data = []
    for s in sources:
        rec_query = select(AIRecommendation).where(AIRecommendation.source_id == s.id).order_by(desc(AIRecommendation.generated_at)).limit(1)
        rec_result = await db.execute(rec_query)
        latest_rec = rec_result.scalar_one_or_none()

        status_color = "GREY"
        if latest_rec:
            if latest_rec.risk_label == "SAFE": status_color = "GREEN"
            elif latest_rec.risk_label == "USE_WITH_CAUTION": status_color = "AMBER"
            elif latest_rec.risk_label == "DO_NOT_USE": status_color = "RED"

        data.append(SourceListElement(
            id=s.id,
            name=s.name,
            latitude=s.latitude,
            longitude=s.longitude,
            status_color=status_color
        ))
        
    return SourceListResponse(data=data)

@router.get("/{source_id}/latest", response_model=SourceDetailResponse)
async def get_source_latest(source_id: int, db: AsyncSession = Depends(get_db)):
    source = await db.get(WaterSource, source_id)
    if not source:
        raise HTTPException(status_code=404, detail={"error": True, "code": "SOURCE_NOT_FOUND", "message": "Water source not found"})

    reading_query = select(WaterReading).where(WaterReading.source_id == source_id).order_by(desc(WaterReading.fetched_at)).limit(1)
    reading = (await db.execute(reading_query)).scalar_one_or_none()

    ai_query = select(AIRecommendation).where(AIRecommendation.source_id == source_id).order_by(desc(AIRecommendation.generated_at)).limit(1)
    ai_rec = (await db.execute(ai_query)).scalar_one_or_none()

    return SourceDetailResponse(
        data=SourceDetailResponseData(
            source=source,
            reading=reading,
            ai_recommendation=ai_rec
        )
    )

@router.get("/{source_id}/history", response_model=SourceHistoryResponse)
async def get_source_history(source_id: int, days: int = Query(7), db: AsyncSession = Depends(get_db)):
    source = await db.get(WaterSource, source_id)
    if not source:
        raise HTTPException(status_code=404, detail={"error": True, "code": "SOURCE_NOT_FOUND", "message": "Water source not found"})

    query = select(WaterReading).where(WaterReading.source_id == source_id).order_by(desc(WaterReading.fetched_at)).limit(days)
    result = await db.execute(query)
    readings = result.scalars().all()
    
    return SourceHistoryResponse(data=readings)

@router.post("/{source_id}/refresh")
async def refresh_source_data(source_id: int, api_key: str = Depends(verify_api_key)):
    return {"success": True, "message": "refresh triggered", "timestamp": datetime.now(timezone.utc).isoformat()}