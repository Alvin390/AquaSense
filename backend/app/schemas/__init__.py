# from datetime import datetime
# from typing import Optional
# from pydantic import BaseModel


# class WaterSourceResponse(BaseModel):
#     id: int
#     name: str
#     source_type: str
#     latitude: float
#     longitude: float
#     city: str
#     is_demo_seed: bool
#     created_at: datetime

#     model_config = {"from_attributes": True}


# class WaterReadingResponse(BaseModel):
#     id: int
#     source_id: int
#     ph: float
#     turbidity: float
#     flood_risk_pct: float
#     water_level: str
#     rainfall_mm: float
#     dissolved_oxygen: float
#     pollution_index: Optional[float]
#     ndwi: float
#     data_source: str
#     fetched_at: datetime

#     model_config = {"from_attributes": True}


# class AIRecommendationResponse(BaseModel):
#     id: int
#     source_id: int
#     risk_label: str
#     summary: str
#     recommendations: list
#     data_drivers: list
#     quality_score: int
#     quantity_score: int
#     generated_at: datetime

#     model_config = {"from_attributes": True}


# class AlertResponse(BaseModel):
#     id: int
#     source_id: int
#     alert_type: str
#     triggered_at: datetime

#     model_config = {"from_attributes": True}


# class PushTokenRequest(BaseModel):
#     expo_push_token: str
#     source_ids: list[int]


# class SourceListResponse(BaseModel):
#     sources: list[WaterSourceResponse]
#     count: int


# class HistoryResponse(BaseModel):
#     source_id: int
#     readings: list[WaterReadingResponse]

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Any

class WaterSourceBase(BaseModel):
    name: str
    source_type: str
    latitude: float
    longitude: float
    city: str
    is_demo_seed: bool = False

class WaterReadingBase(BaseModel):
    ph: float
    turbidity: float
    flood_risk_pct: float
    water_level: str
    rainfall_mm: float
    dissolved_oxygen: float
    pollution_index: Optional[float] = None
    ndwi: float
    data_source: str

class WaterSourceSchema(WaterSourceBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class WaterReadingSchema(WaterReadingBase):
    id: int
    source_id: int
    fetched_at: datetime
    class Config:
        from_attributes = True

class AIRecommendationSchema(BaseModel):
    id: int
    reading_id: int
    source_id: int
    risk_label: str
    summary: str
    recommendations: List[str]
    data_drivers: List[str]
    quality_score: int
    quantity_score: int
    generated_at: datetime
    class Config:
        from_attributes = True

class AlertSchema(BaseModel):
    id: int
    source_id: int
    alert_type: str
    triggered_at: datetime
    last_notified_at: datetime
    class Config:
        from_attributes = True

class StandardResponse(BaseModel):
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SourceListElement(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    status_color: str

class SourceListResponse(StandardResponse):
    data: List[SourceListElement]

class SourceDetailResponseData(BaseModel):
    source: WaterSourceSchema
    reading: Optional[WaterReadingSchema] = None
    ai_recommendation: Optional[AIRecommendationSchema] = None

class SourceDetailResponse(StandardResponse):
    data: SourceDetailResponseData

class SourceHistoryResponse(StandardResponse):
    data: List[WaterReadingSchema]

class NotificationRegisterBody(BaseModel):
    expo_push_token: str
    source_ids_to_watch: List[int]
class AlertResponse(StandardResponse):
    data: List[AlertSchema]
class PushTokenRequest(BaseModel):
    expo_push_token: str
    source_ids_to_watch: List[int]