import pytest
from app.models.water_source import WaterSource

@pytest.mark.asyncio
async def test_get_sources_empty(client):
    response = await client.get("/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == []

@pytest.mark.asyncio
async def test_create_and_get_source(client, db_session):
    # Add a source directly to DB
    source = WaterSource(
        name="Test River",
        source_type="river",
        latitude=-1.2,
        longitude=36.8,
        city="Nairobi"
    )
    db_session.add(source)
    await db_session.commit()

    response = await client.get("/sources")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["name"] == "Test River"

@pytest.mark.asyncio
async def test_get_source_latest_not_found(client):
    response = await client.get("/sources/999/latest")
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "SOURCE_NOT_FOUND"

@pytest.mark.asyncio
async def test_refresh_source_unauthorized(client):
    response = await client.post("/sources/1/refresh")
    assert response.status_code == 401
