from fastapi import APIRouter, status
from app.schemas import NotificationRegisterBody  # Moses's schema

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Simple, global in-memory database substitute for the hackathon
# Key: expo_push_token (str) -> Value: list of source_ids (list[int])
PUSH_TOKEN_REGISTRY: dict[str, list[int]] = {}


@router.post("/register", status_code=status.HTTP_200_OK)
async def register_notifications(body: NotificationRegisterBody):
    """
    Registers or updates an Expo Push Token and links it to specific 
    Water Source IDs that the user wants to monitor.
    """
    # 1. Extract data from Moses's schema
    token = body.expo_push_token
    source_ids = body.source_ids_to_watch
    
    # 2. Upsert into our global registry
    PUSH_TOKEN_REGISTRY[token] = source_ids
    
    # 3. Return standard success JSON format for Fidel
    return {"success": True}