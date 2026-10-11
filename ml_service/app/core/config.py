from pydantic_settings import BaseSettings
import os
from pathlib import Path

# Resolve data directory relative to repository root and package location
DEFAULT_DATA_DIR = str((Path(__file__).resolve().parents[2] / "data").resolve())

class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    DATA_PATH: str = os.getenv("DATA_PATH", DEFAULT_DATA_DIR)
    FRONTEND_ORIGINS: str = os.getenv("FRONTEND_ORIGINS", "")

    class Config:
        env_file = ".env"

def get_settings():
    return Settings()