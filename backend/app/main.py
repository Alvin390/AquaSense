# AquaSense FastAPI entrypoint
# Responsibilities:
#   - Create FastAPI app instance with metadata (title, version, docs_url)
#   - Register all routers (sources, alerts, notifications)
#   - Add GZipMiddleware, CORSMiddleware
#   - Startup event: init DB tables, seed demo data, start APScheduler
#   - Shutdown event: stop scheduler gracefully
#   - GET /health endpoint
