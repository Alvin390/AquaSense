class AIService:
    """Groq / Llama 3 — generates structured water safety recommendations."""

    async def generate_recommendation(self, reading: dict) -> dict:
        # TODO: Alvin
        # Model: llama-3.3-70b-versatile (primary), llama-3.1-8b-instant (fallback)
        # Key rotation: GROQ_API_KEY_1 → GROQ_API_KEY_2 on HTTP 429 → seeded template
        # Output JSON: {risk_label, summary, recommendations[], data_drivers[]}
        # Called once per source per 36h cycle — result stored in ai_recommendations table
        raise NotImplementedError
