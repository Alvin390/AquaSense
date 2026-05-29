import asyncio
from sqlalchemy import select

from app.database import engine, Base, AsyncSessionLocal
from app.models.water_source import WaterSource
from app.models.water_reading import WaterReading
from app.models.ai_recommendation import AIRecommendation

SOURCES = [
    {"name": "Nairobi River (Westlands Crossing)", "source_type": "river",     "latitude": -1.2635, "longitude": 36.8030, "city": "Nairobi"},
    {"name": "Athi River / Mavoko Intake",          "source_type": "river",     "latitude": -1.3978, "longitude": 36.9540, "city": "Nairobi"},
    {"name": "Mathare River (Mathare North)",        "source_type": "river",     "latitude": -1.2617, "longitude": 36.8637, "city": "Nairobi"},
    {"name": "Ngong River (Kibera adjacent)",        "source_type": "river",     "latitude": -1.3025, "longitude": 36.7994, "city": "Nairobi"},
    {"name": "Ruiru Reservoir Intake",               "source_type": "reservoir", "latitude": -1.1500, "longitude": 36.9700, "city": "Nairobi"},
    {"name": "Tana River Headwaters (Aberdare)",     "source_type": "river",     "latitude": -0.4167, "longitude": 36.9500, "city": "Nyeri"},
]

READINGS = [
    {"ph": 6.8, "turbidity": 12.5, "flood_risk_pct": 15.0, "water_level": "Normal",   "rainfall_mm": 4.2,  "dissolved_oxygen": 7.2, "ndwi": 0.42, "data_source": "seeded"},
    {"ph": 7.1, "turbidity":  8.3, "flood_risk_pct": 22.0, "water_level": "Normal",   "rainfall_mm": 6.1,  "dissolved_oxygen": 6.8, "ndwi": 0.51, "data_source": "seeded"},
    {"ph": 5.8, "turbidity": 28.7, "flood_risk_pct": 38.0, "water_level": "Low",      "rainfall_mm": 1.5,  "dissolved_oxygen": 5.1, "ndwi": 0.31, "data_source": "seeded"},
    {"ph": 7.4, "turbidity":  6.1, "flood_risk_pct": 12.0, "water_level": "Normal",   "rainfall_mm": 3.8,  "dissolved_oxygen": 7.9, "ndwi": 0.55, "data_source": "seeded"},
    {"ph": 7.8, "turbidity":  3.2, "flood_risk_pct":  8.0, "water_level": "Normal",   "rainfall_mm": 5.0,  "dissolved_oxygen": 8.5, "ndwi": 0.63, "data_source": "seeded"},
    {"ph": 6.5, "turbidity": 18.4, "flood_risk_pct": 45.0, "water_level": "Low",      "rainfall_mm": 12.3, "dissolved_oxygen": 6.2, "ndwi": 0.38, "data_source": "seeded"},
]

AI_DATA = [
    {"risk_label": "USE_WITH_CAUTION", "summary": "Nairobi River shows moderate turbidity. Boil before drinking.", "recommendations": ["Boil before drinking", "Safe for washing"], "data_drivers": ["turbidity: 12.5 NTU"], "quality_score": 62, "quantity_score": 75},
    {"risk_label": "SAFE",             "summary": "Athi River readings within safe parameters. Monitor after rainfall.", "recommendations": ["Safe for household use", "Retest after heavy rain"], "data_drivers": ["ph: 7.1", "turbidity: 8.3 NTU"], "quality_score": 78, "quantity_score": 80},
    {"risk_label": "DO_NOT_USE",       "summary": "Mathare River pH below safe range. Avoid all contact.", "recommendations": ["Do not use", "Seek alternative source", "Report to WASREB"], "data_drivers": ["ph: 5.8 (below 6.0 threshold)"], "quality_score": 35, "quantity_score": 45},
    {"risk_label": "SAFE",             "summary": "Ngong River quality is good. Suitable for household use.", "recommendations": ["Safe for household use"], "data_drivers": ["ph: 7.4", "ndwi: 0.55"], "quality_score": 81, "quantity_score": 78},
    {"risk_label": "SAFE",             "summary": "Ruiru Reservoir: excellent quality. Low turbidity, healthy pH.", "recommendations": ["Safe for all uses"], "data_drivers": ["turbidity: 3.2 NTU", "dissolved_oxygen: 8.5 mg/L"], "quality_score": 92, "quantity_score": 88},
    {"risk_label": "USE_WITH_CAUTION", "summary": "Tana River headwaters elevated flood risk. Water level dropping.", "recommendations": ["Boil before drinking", "Monitor flood alerts"], "data_drivers": ["flood_risk_pct: 45%", "water_level: Low"], "quality_score": 58, "quantity_score": 52},
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        existing = await session.execute(
            select(WaterSource).where(WaterSource.is_demo_seed == True).limit(1)
        )
        if existing.scalars().first():
            print("Seed data already present — skipping.")
            return

        for i, src_data in enumerate(SOURCES):
            source = WaterSource(**src_data, is_demo_seed=True)
            session.add(source)
            await session.flush()

            reading = WaterReading(source_id=source.id, **READINGS[i])
            session.add(reading)
            await session.flush()

            ai = AIRecommendation(source_id=source.id, reading_id=reading.id, **AI_DATA[i])
            session.add(ai)

        await session.commit()
        print(f"Seeded {len(SOURCES)} water sources with readings and AI recommendations.")


if __name__ == "__main__":
    asyncio.run(seed())
