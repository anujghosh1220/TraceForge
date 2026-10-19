from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "TraceForge"
    database_url: str = "sqlite:///./traceforge.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    max_dataset_cases: int = 500
    request_size_limit: int = 1024 * 1024
    seed_demo: bool = True
    class Config:
        env_file = ".env"

settings = Settings()
def cors_list():
    return [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
