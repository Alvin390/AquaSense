# SentinelService — Sentinel Hub Process API integration
# Auth: OAuth2 client credentials (CLIENT_ID + CLIENT_SECRET)
# Evalscript: computes NDWI (B3, B8), turbidity proxy (B4, B3), flood index (B11, B12)
# For each water source bounding box → returns band stats (mean/min/max) as dict
# Handles token refresh, request retry (3 attempts), and timeout (10s hard limit)
