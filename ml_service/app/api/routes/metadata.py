from fastapi import APIRouter
from ml_service.app.schemas.metadata import MetadataResponse
from ml_service.app.services.metadata_service import MetadataService

router = APIRouter()
metadata_service = MetadataService()

@router.get("/metadata", response_model=MetadataResponse)
async def get_metadata():
    return metadata_service.get_metadata()