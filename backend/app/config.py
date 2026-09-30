import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CAPACITY CONNECT"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: SQLite by default for zero-setup local dev, PostgreSQL for Render
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./capacity_connect.db")
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("JWT_SECRET", "capacity-connect-super-secret-key-sih-2026-imd-moes")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,*")
    
    # AI Config
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic") # "deterministic", "gemini", "openai"
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"))
    MAX_UPLOAD_SIZE_MB: int = 25
    
    # Port for Render
    PORT: int = int(os.getenv("PORT", 8000))

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
