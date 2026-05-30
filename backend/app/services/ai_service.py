import asyncio
import json
import logging
from dataclasses import dataclass, replace
from typing import TypedDict

from groq import APIConnectionError, Groq, RateLimitError

from app.config import settings
from app.utils.water_math import calc_quality_score, calc_quantity_score

logger = logging.getLogger(__name__)

GROQ_MODEL_PRIMARY = "llama-3.3-70b-versatile"
GROQ_MODEL_FALLBACK = "llama-3.1-8b-instant"  # defined; not used in fallback chain per plan


# ── Data Contracts ─────────────────────────────────────────────────────────────

class WaterReadingInput(TypedDict):
    source_id: int
    source_name: str
    city: str
    fetched_at: str          # ISO 8601 string
    ph: float
    turbidity: float         # NTU
    flood_risk_pct: float    # 0.0–100.0
    water_level: str         # "Normal" | "Low" | "Very Low" | "Flooded" | "Dry"
    rainfall_mm: float       # last 24 hours
    dissolved_oxygen: float  # mg/L
    pollution_index: float | None
    ndwi: float


@dataclass
class AIResult:
    source_id: int
    risk_label: str           # "SAFE" | "USE_WITH_CAUTION" | "DO_NOT_USE"
    summary: str
    recommendations: list[str]
    data_drivers: list[str]
    quality_score: int        # 0–100
    quantity_score: int       # 0–100
    is_fallback: bool


# ── Prompts ─────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are AquaSense, an AI water safety assistant for Kenyan communities. "
    "You analyze satellite and weather data to give clear, actionable water safety "
    "advice. Always respond in plain English, avoid technical jargon, use simple "
    "language a rural Kenyan citizen can understand. Be honest about uncertainty. "
    "Be helpful and reassuring while being accurate about risks. "
    "Respond ONLY with a valid JSON object. No markdown. No preamble. No trailing text. "
    "Your entire response must be parseable by json.loads()."
)


def build_user_prompt(reading: WaterReadingInput) -> str:
    pollution_str = (
        f"{reading['pollution_index']:.1f}"
        if reading["pollution_index"] is not None
        else "unavailable"
    )
    return (
        f"Analyze the following water quality readings for {reading['source_name']}, "
        f"located in {reading['city']}, Kenya, as of {reading['fetched_at']}.\n\n"
        f"pH Level: {reading['ph']} (safe range: 6.5–8.5)\n"
        f"Turbidity Estimate: {reading['turbidity']:.1f} NTU (estimated from satellite B4/B3 ratio)\n"
        f"Flood Risk Probability: {reading['flood_risk_pct']:.0f}% (from rainfall + NDWI data)\n"
        f"Water Availability: {reading['water_level']} (from satellite water extent delta)\n"
        f"Dissolved Oxygen Estimate: {reading['dissolved_oxygen']:.1f} mg/L (modeled)\n"
        f"Recent Rainfall: {reading['rainfall_mm']:.1f} mm in past 24 hours\n"
        f"Pollution Context: {pollution_str}\n\n"
        "Based on this data, respond with a JSON object containing exactly these keys:\n"
        '- "risk_label": one of "SAFE", "USE_WITH_CAUTION", or "DO_NOT_USE"\n'
        '- "summary": 2–3 plain-English sentences describing the water situation for a local resident\n'
        '- "recommendations": array of 3–5 specific action strings a local resident should take\n'
        '- "data_drivers": array of 2–4 strings naming the data points that most influenced your assessment'
    )


# ── Groq API Layer ──────────────────────────────────────────────────────────────

def _get_groq_client(api_key: str) -> Groq:
    return Groq(api_key=api_key)


async def _call_groq(prompt: str, api_key: str, model: str) -> str | None:
    """Call Groq synchronously via asyncio.to_thread. Returns raw JSON string or None."""
    if not api_key:
        return None
    client = _get_groq_client(api_key)
    try:
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=1200,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content
    except RateLimitError:
        return None  # caller interprets None as rate-limited → try key 2
    except APIConnectionError as e:
        logger.error("Groq API connection error: %s", str(e))
        return None
    except Exception as e:  # noqa: BLE001
        logger.error("Groq unexpected error: %s", str(e))
        return None


def parse_groq_json(raw: str) -> dict | None:
    """Strip fences, parse JSON, validate risk_label. Returns dict or None on failure."""
    raw = raw.strip()

    # Strip accidental markdown code fences
    if raw.startswith("```"):
        raw = raw[3:]                     # remove opening ```
        if raw.startswith("json"):
            raw = raw[4:]                 # remove language hint
        raw = raw.strip()
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Groq JSON parse failed. Raw (first 200): %s", raw[:200])
        return None

    risk_label = parsed.get("risk_label", "")
    if risk_label not in {"SAFE", "USE_WITH_CAUTION", "DO_NOT_USE"}:
        logger.warning(
            "Invalid risk_label '%s' from Groq — defaulting to USE_WITH_CAUTION", risk_label
        )
        parsed["risk_label"] = "USE_WITH_CAUTION"

    recs = parsed.get("recommendations", [])
    if not isinstance(recs, list) or not (3 <= len(recs) <= 5):
        logger.warning(
            "Unexpected recommendations shape from Groq (len=%s) — continuing", len(recs) if isinstance(recs, list) else "n/a"
        )

    return parsed


# ── Seeded Fallback Responses ────────────────────────────────────────────────────

# One entry per water source name (must match nairobi_seed.py exactly) + "default".
# All use is_fallback=True and conservative USE_WITH_CAUTION label.
SEEDED_RESPONSES: dict[str, AIResult] = {
    "Nairobi River (Westlands Crossing)": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for Nairobi River is being refreshed. "
            "The river runs through a densely populated urban area and may carry surface runoff. "
            "As a precaution, treat any water from this source before drinking."
        ),
        recommendations=[
            "Boil water for at least 1 minute before use.",
            "Use a certified filter if one is available.",
            "Avoid direct contact with the water until updated data is available.",
            "Check back in a few hours for updated readings.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
    "Athi River / Mavoko Intake": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for Athi River is being refreshed. "
            "This source serves as a primary intake for treated water supply in the region. "
            "As a precaution, ensure standard treatment is applied before use."
        ),
        recommendations=[
            "Boil water for at least 1 minute before use.",
            "Use a certified filter if one is available.",
            "Check back in a few hours for updated readings.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
    "Mathare River (Mathare North)": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for Mathare River is being refreshed. "
            "This river flows through a densely populated settlement and is susceptible to contamination. "
            "Treat any water from this source before use."
        ),
        recommendations=[
            "Do not use this water without treatment.",
            "Boil water for at least 1 minute before use.",
            "Seek an alternative water source if possible.",
            "Check back in a few hours for updated readings.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
    "Ngong River (Kibera adjacent)": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for Ngong River is being refreshed. "
            "As a precaution, treat any water from this source before drinking."
        ),
        recommendations=[
            "Boil water for at least 1 minute before use.",
            "Use a certified filter if one is available.",
            "Check back in a few hours for updated readings.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
    "Ruiru Reservoir Intake": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for Ruiru Reservoir is being refreshed. "
            "This reservoir supplies northern Nairobi and receives municipal treatment. "
            "Ensure standard municipal treatment is applied before direct use."
        ),
        recommendations=[
            "Ensure water is treated by the municipal utility before use.",
            "Boil water for at least 1 minute if using an untreated source.",
            "Check back in a few hours for updated readings.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
    "Tana River Headwaters (Aberdare)": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for Tana River headwaters is being refreshed. "
            "Highland sources can be sensitive to rainfall and land-use changes in the Aberdare region. "
            "As a precaution, treat any water from this source before drinking."
        ),
        recommendations=[
            "Boil water for at least 1 minute before use.",
            "Use a certified filter if one is available.",
            "Monitor flood alerts in the Aberdare region.",
            "Check back in a few hours for updated readings.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
    "default": AIResult(
        source_id=0,
        risk_label="USE_WITH_CAUTION",
        summary=(
            "Water quality data for this source is being refreshed. "
            "As a precaution, treat any water from unknown sources before drinking."
        ),
        recommendations=[
            "Boil water for at least 1 minute before use.",
            "Use a certified filter if one is available.",
            "Check back in a few hours for updated data.",
        ],
        data_drivers=["data_refresh_in_progress"],
        quality_score=50,
        quantity_score=50,
        is_fallback=True,
    ),
}


def get_seeded_fallback(source_name: str, source_id: int = 0) -> AIResult:
    """Return a pre-written fallback AIResult. Never raises."""
    template = SEEDED_RESPONSES.get(source_name, SEEDED_RESPONSES["default"])
    return replace(template, source_id=source_id)


# ── Main Entry Point (Moses calls this from scheduler) ─────────────────────────

async def generate_recommendation(reading: WaterReadingInput) -> AIResult:
    """Generate a water safety recommendation for a single source reading.

    Fallback chain:
      Groq key 1 → Groq key 2 → seeded response (never raises, never returns None).
    """
    prompt = build_user_prompt(reading)

    # Attempt key 1
    raw = await _call_groq(prompt, settings.groq_api_key_1, GROQ_MODEL_PRIMARY)

    if raw is None:
        logger.warning("Groq key 1 rate limited — switching to key 2")
        raw = await _call_groq(prompt, settings.groq_api_key_2, GROQ_MODEL_PRIMARY)

    if raw is None:
        logger.warning(
            "Both Groq keys rate limited — serving seeded recommendation for %s",
            reading["source_name"],
        )
        return get_seeded_fallback(reading["source_name"], reading["source_id"])

    parsed = parse_groq_json(raw)
    if parsed is None:
        return get_seeded_fallback(reading["source_name"], reading["source_id"])

    q_score = calc_quality_score(
        reading["ph"], reading["turbidity"], reading["pollution_index"]
    )
    qty_score = calc_quantity_score(
        reading["water_level"], reading["flood_risk_pct"], reading["rainfall_mm"]
    )

    return AIResult(
        source_id=reading["source_id"],
        risk_label=parsed["risk_label"],
        summary=parsed["summary"],
        recommendations=parsed.get("recommendations", []),
        data_drivers=parsed.get("data_drivers", []),
        quality_score=q_score,
        quantity_score=qty_score,
        is_fallback=False,
    )
