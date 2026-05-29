# Sources router — /sources prefix
# GET  /sources                      → list sources (filter by city or lat/lng/radius)
# GET  /sources/{source_id}/latest   → latest reading + AI recommendation
# GET  /sources/{source_id}/history  → readings for past N days (default 7)
# POST /sources/{source_id}/refresh  → force data refresh (admin, X-API-Key required)
