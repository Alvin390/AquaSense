from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class WaterSourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    latitude: float
    longitude: float
    city: str
    is_demo_seed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class WaterReadingResponse(BaseModel):
    id: int
    source_id: int
    ph: float
    turbidity: float
    flood_risk_pct: float
    water_level: str
    rainfall_mm: float
    dissolved_oxygen: float
    pollution_index: Optional[float]
    ndwi: float
    data_source: str
    fetched_at: datetime

    model_config = {"from_attributes": True}


class AIRecommendationResponse(BaseModel):
    id: int
    source_id: int
    risk_label: str
    summary: str
    recommendations: list
    data_drivers: list
    quality_score: int
    quantity_score: int
    generated_at: datetime

    model_config = {"from_attributes": True}


class AlertResponse(BaseModel):
    id: int
    source_id: int
    alert_type: str
    triggered_at: datetime

    model_config = {"from_attributes": True}


class PushTokenRequest(BaseModel):
    expo_push_token: str
    source_ids: list[int]


class SourceListResponse(BaseModel):
    sources: list[WaterSourceResponse]
    count: int


class HistoryResponse(BaseModel):
    source_id: int
    readings: list[WaterReadingResponse]
