# SQLAlchemy 2.0 async engine + session factory
# Uses aiosqlite driver: sqlite+aiosqlite:///./aquasense.db
# Exposes: engine, AsyncSessionLocal, Base (declarative), get_db (FastAPI dependency)
# WAL mode enabled for better concurrent read performance
