from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AlertLog(Base):
    __tablename__ = "alert_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(Integer, ForeignKey("water_sources.id"))
    alert_type: Mapped[str] = mapped_column(String(30))  # ph_critical|flood_high|water_scarce
    triggered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_notified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
