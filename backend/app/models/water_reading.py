from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WaterReading(Base):
    __tablename__ = "water_readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(Integer, ForeignKey("water_sources.id"))
    ph: Mapped[float] = mapped_column(Float)
    turbidity: Mapped[float] = mapped_column(Float)
    flood_risk_pct: Mapped[float] = mapped_column(Float)
    water_level: Mapped[str] = mapped_column(String(20))  # Normal|Low|Very Low|Flooded|Dry
    rainfall_mm: Mapped[float] = mapped_column(Float, default=0.0)
    dissolved_oxygen: Mapped[float] = mapped_column(Float)
    pollution_index: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ndwi: Mapped[float] = mapped_column(Float)
    data_source: Mapped[str] = mapped_column(String(30))  # sentinel_hub|seeded|cached
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_water_readings_source_fetched", "source_id", "fetched_at"),
    )
