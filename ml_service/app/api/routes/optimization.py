from fastapi import APIRouter, HTTPException
from ml_service.app.schemas.optimization import OptimizationRequest, OptimizationResponse
from ml_service.app.services.resource_optimizer_service import ResourceOptimizerService
from datetime import datetime

router = APIRouter()
optimizer_service = ResourceOptimizerService()

@router.post("/crop-allocation", response_model=OptimizationResponse)
async def optimize_crop_allocation(request: OptimizationRequest):
    try:
        result = optimizer_service.optimize_crop_allocation(request)
        return OptimizationResponse(result=result, generated_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))