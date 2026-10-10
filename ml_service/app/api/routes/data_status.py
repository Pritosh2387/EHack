from fastapi import APIRouter
from ml_service.app.schemas.common import DataStatusResponse
from ml_service.app.services.data_status_service import DataStatusService

router = APIRouter()
data_status_service = DataStatusService()

@router.get("/data-status", response_model=DataStatusResponse)
async def get_data_status():
    return data_status_service.get_data_status()