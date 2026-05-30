from fastapi import APIRouter, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.notification_subscription import NotificationSubscription
from app.schemas import NotificationRegisterBody
from datetime import datetime, timezone

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/register", status_code=status.HTTP_200_OK)
async def register_notifications(
    body: NotificationRegisterBody,
    db: AsyncSession = Depends(get_db)
):
    """
    Registers or updates an Expo Push Token and links it to specific
    Water Source IDs that the user wants to monitor.
    """
    token = body.expo_push_token
    source_ids = body.source_ids_to_watch

    query = select(NotificationSubscription).where(
        NotificationSubscription.expo_push_token == token
    )
    result = await db.execute(query)
    subscription = result.scalar_one_or_none()

    if subscription:
        subscription.source_ids = source_ids
    else:
        new_subscription = NotificationSubscription(
            expo_push_token=token,
            source_ids=source_ids
        )
        db.add(new_subscription)

    await db.commit()

    return {
        "success": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
