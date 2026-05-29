from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WaterSource(Base):
    __tablename__ = "water_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(50))  # river|borehole|reservoir|tap
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    city: Mapped[str] = mapped_column(String(100))
    is_demo_seed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_water_sources_city", "city"),
        Index("ix_water_sources_demo", "is_demo_seed"),
    )
