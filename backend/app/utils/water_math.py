def ndwi(b3: float, b8: float) -> float:
    """Normalized Difference Water Index: (B3 - B8) / (B3 + B8)"""
    denom = b3 + b8
    return (b3 - b8) / denom if denom != 0 else 0.0


def turbidity_proxy(b4: float, b3: float) -> float:
    # TODO: Moses — derive NTU proxy from B4/B3 ratio from Sentinel-2 stats
    raise NotImplementedError


def flood_index(ndwi_val: float, b11: float) -> float:
    # TODO: Moses — combine ndwi with SWIR band B11 to estimate flood probability 0–1
    raise NotImplementedError


def calc_quality_score(ph: float, turbidity: float, pollution_index: float | None) -> int:
    """Composite drinking-water quality score (0–100, higher = safer).

    Weights: pH 40%, turbidity 35%, pollution 25%.
    """
    # pH component (40%)
    if 6.5 <= ph <= 8.5:
        ph_pts: float = 100.0
    elif 6.0 <= ph < 6.5 or 8.5 < ph <= 9.0:
        ph_pts = 50.0
    else:
        ph_pts = 0.0

    # Turbidity component (35%)
    if turbidity <= 1.0:
        turb_pts: float = 100.0
    elif turbidity <= 4.0:
        turb_pts = 100.0 - ((turbidity - 1.0) / 3.0 * 100.0)
    else:
        turb_pts = 0.0

    # Pollution component (25%)
    if pollution_index is None:
        poll_pts: float = 75.0  # neutral — data unavailable
    elif pollution_index <= 50:
        poll_pts = 100.0
    elif pollution_index <= 150:
        poll_pts = 100.0 - ((pollution_index - 50.0) / 100.0 * 100.0)
    else:
        poll_pts = 0.0

    score = int((ph_pts * 0.40) + (turb_pts * 0.35) + (poll_pts * 0.25))
    return max(0, min(100, score))


def calc_quantity_score(water_level: str, flood_risk_pct: float, rainfall_mm: float) -> int:
    """Composite water-availability score (0–100, higher = more water available).

    Weights: water_level 50%, flood_risk 30%, rainfall 20%.
    """
    # Water level component (50%)
    level_map: dict[str, float] = {
        "Normal": 100.0,
        "Low": 60.0,
        "Very Low": 20.0,
        "Dry": 0.0,
        "Flooded": 40.0,
    }
    level_pts: float = level_map.get(water_level, 60.0)

    # Flood risk component (30%)
    if flood_risk_pct <= 30.0:
        flood_pts: float = 100.0
    elif flood_risk_pct <= 65.0:
        flood_pts = 100.0 - ((flood_risk_pct - 30.0) / 35.0 * 100.0)
    else:
        flood_pts = 0.0

    # Rainfall component (20%) — higher rainfall = higher runoff risk
    if rainfall_mm <= 5.0:
        rain_pts: float = 100.0
    elif rainfall_mm <= 50.0:
        rain_pts = 100.0 - ((rainfall_mm - 5.0) / 45.0 * 50.0)
    else:
        rain_pts = 0.0

    score = int((level_pts * 0.50) + (flood_pts * 0.30) + (rain_pts * 0.20))
    return max(0, min(100, score))


def score_to_label(score: int) -> str:
    """Map a 0–100 score to a display label for Tab 2 gauges."""
    if score >= 80:
        return "SAFE"
    elif score >= 50:
        return "MODERATE"
    else:
        return "UNSAFE"


def safe_range_status(value: float, low: float, high: float) -> str:
    """Returns SAFE | CAUTION | UNSAFE based on whether value is within [low, high]."""
    if value < low or value > high:
        return "UNSAFE"
    margin = (high - low) * 0.1
    if value < low + margin or value > high - margin:
        return "CAUTION"
    return "SAFE"


if __name__ == "__main__":
    # Quality score boundary checks
    assert calc_quality_score(7.0, 0.5, 20) == 100, "perfect inputs should score 100"
    assert calc_quality_score(5.5, 5.0, 200) == 0, "all-bad inputs should score 0"
    mid = calc_quality_score(7.0, 2.5, None)
    assert 0 <= mid <= 100, f"mid score out of range: {mid}"

    # Quantity score boundary checks
    assert calc_quantity_score("Normal", 10.0, 3.0) == 100, "all-good inputs should score 100"
    very_low = calc_quantity_score("Very Low", 75.0, 60.0)
    assert 0 <= very_low <= 100, f"very_low score out of range: {very_low}"

    # score_to_label mapping
    assert score_to_label(85) == "SAFE"
    assert score_to_label(80) == "SAFE"
    assert score_to_label(79) == "MODERATE"
    assert score_to_label(60) == "MODERATE"
    assert score_to_label(50) == "MODERATE"
    assert score_to_label(49) == "UNSAFE"
    assert score_to_label(30) == "UNSAFE"
    assert score_to_label(0) == "UNSAFE"

    # All scores are valid integers in 0–100
    for ph in [5.0, 6.2, 7.0, 8.0, 9.5]:
        for turb in [0.5, 2.5, 5.0]:
            for poll in [None, 0, 50, 100, 200]:
                s = calc_quality_score(ph, turb, poll)
                assert isinstance(s, int) and 0 <= s <= 100, f"quality out of range: {s}"

    for level in ["Normal", "Low", "Very Low", "Dry", "Flooded"]:
        for flood in [0.0, 30.0, 65.0, 100.0]:
            for rain in [0.0, 5.0, 25.0, 60.0]:
                s = calc_quantity_score(level, flood, rain)
                assert isinstance(s, int) and 0 <= s <= 100, f"quantity out of range: {s}"

    print("All water_math assertions passed.")
