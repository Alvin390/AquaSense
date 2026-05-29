# AIService — Groq / Llama 3 integration
# Model: llama-3.3-70b-versatile (primary), llama-3.1-8b-instant (fallback)
# Key rotation: GROQ_API_KEY_1 → GROQ_API_KEY_2 on HTTP 429 → seeded template
# Input: WaterReadingRecord dict → constructs system + user prompt
# Output: parsed JSON → { risk_label, summary, recommendations[], data_drivers[] }
# Results cached in DB — called once per source per 36h cycle, not per user request
