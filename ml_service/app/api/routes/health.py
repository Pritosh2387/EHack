from fastapi import APIRouter
from ml_service.app.schemas.common import HealthResponse
from ml_service.app.core.config import get_settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        service="water-shadow-analytics"
    )