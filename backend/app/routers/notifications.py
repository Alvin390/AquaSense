from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import PushTokenRequest

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/register")
async def register_push_token(payload: PushTokenRequest, db: AsyncSession = Depends(get_db)):
    # TODO: Moses — persist Expo push token + source_ids to DB for notification dispatch
    return {"status": "registered", "token": payload.expo_push_token}
