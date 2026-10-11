from pydantic_settings import BaseSettings
import os
from pathlib import Path

DEFAULT_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))

class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    DATA_PATH: str = os.getenv("DATA_PATH", DEFAULT_DATA_DIR)

    class Config:
        env_file = ".env"

def get_settings():
    return Settings()