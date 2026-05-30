import pytest
from app.services.sentinel_service import parse_sentinel_response

def test_parse_sentinel_response_valid():
    mock_data = {
        "data": [{
            "outputs": {
                "default": {
                    "bands": {
                        "B03": {"stats": {"mean": 0.15}},
                        "B04": {"stats": {"mean": 0.12}},
                        "B08": {"stats": {"mean": 0.05}},
                        "B11": {"stats": {"mean": 0.02}}
                    }
                }
            }
        }]
    }
    result = parse_sentinel_response(mock_data)
    assert result["status"] == "success"
    assert "ndwi" in result
    assert "turbidity_proxy" in result
    assert "flood_index" in result
    assert result["ndwi"] > 0 # (0.15 - 0.05) / 0.2 = 0.5

def test_parse_sentinel_response_invalid():
    with pytest.raises(ValueError):
        parse_sentinel_response({})
