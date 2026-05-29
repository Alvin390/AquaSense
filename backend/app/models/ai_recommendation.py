from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True)
    reading_id: Mapped[int] = mapped_column(Integer, ForeignKey("water_readings.id"))
    source_id: Mapped[int] = mapped_column(Integer, ForeignKey("water_sources.id"))
    risk_label: Mapped[str] = mapped_column(String(20))  # SAFE|USE_WITH_CAUTION|DO_NOT_USE
    summary: Mapped[str] = mapped_column(Text)
    recommendations: Mapped[list] = mapped_column(JSON)
    data_drivers: Mapped[list] = mapped_column(JSON)
    quality_score: Mapped[int] = mapped_column(Integer)
    quantity_score: Mapped[int] = mapped_column(Integer)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
