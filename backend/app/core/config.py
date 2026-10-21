import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "TraceForge"
    database_url: str = os.environ.get("DATABASE_URL") or ("sqlite:////tmp/traceforge.db" if os.environ.get("VERCEL") else "sqlite:///./traceforge.db")
    cors_origins: str = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://traceforge-ashy.vercel.app")
    max_dataset_cases: int = 500
    request_size_limit: int = 1024 * 1024
    seed_demo: bool = os.environ.get("SEED_DEMO", "true").lower() == "true"
    class Config:
        env_file = ".env"

settings = Settings()
def cors_list():
    return [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
