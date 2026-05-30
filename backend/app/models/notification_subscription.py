from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime, timezone
from app.database import Base

class NotificationSubscription(Base):
    __tablename__ = "notification_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    expo_push_token = Column(String, unique=True, index=True, nullable=False)
    source_ids = Column(JSON, nullable=False)  # List of source IDs to watch
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
