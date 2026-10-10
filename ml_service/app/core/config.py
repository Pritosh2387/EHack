from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    DATA_PATH: str = "./data"

    class Config:
        env_file = ".env"

def get_settings():
    return Settings()