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


def quality_score(ph: float, turbidity: float, ndwi_val: float) -> int:
    # TODO: Alvin — composite 0–100 quality score (higher = safer)
    raise NotImplementedError


def quantity_score(water_level: str, rainfall_mm: float, river_discharge: float) -> int:
    # TODO: Alvin — composite 0–100 quantity score (higher = more water available)
    raise NotImplementedError


def safe_range_status(value: float, low: float, high: float) -> str:
    """Returns SAFE | CAUTION | UNSAFE based on whether value is within [low, high]."""
    if value < low or value > high:
        return "UNSAFE"
    margin = (high - low) * 0.1
    if value < low + margin or value > high - margin:
        return "CAUTION"
    return "SAFE"
