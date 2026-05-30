import asyncio
from app.database import engine, AsyncSessionLocal  # adjust if named differently
from app.models import WaterSource, WaterReading, AIRecommendation, AlertLog
from sqlalchemy.future import select

async def test_orm():

    # Test 1 — Tables exist
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda c: print("✅ Engine connected"))
    except Exception as e:
        print(f"❌ Engine error: {e}")

    # Test 2 — Query all records
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(WaterSource))
            sources = result.scalars().all()
            print(f"✅ WaterSource query works — {len(sources)} records")
    except Exception as e:
        print(f"❌ Query error: {e}")

    # Test 3 — Insert a record
    try:
        async with AsyncSessionLocal() as db:
            # test = WaterSource(name="Test Source", location="Nairobi")
            test = WaterSource(name="Test Source",source_type="river",latitude=-1.2921,longitude=36.8219,
    city="Nairobi",
    is_demo_seed=False)
            db.add(test)
            await db.commit()
            await db.refresh(test)
            print(f"✅ Insert works — ID: {test.id}")
    except Exception as e:
        print(f"❌ Insert error: {e}")

asyncio.run(test_orm())