from fastapi import APIRouter, HTTPException
from ml_service.app.schemas.scenarios import CropShiftRequest, CropShiftResponse
from ml_service.app.services.crop_shift_simulator_service import CropShiftSimulatorService
from datetime import datetime

router = APIRouter()
crop_shift_service = CropShiftSimulatorService()

@router.post("/crop-shift", response_model=CropShiftResponse)
async def simulate_crop_shift(request: CropShiftRequest):
    try:
        result = crop_shift_service.simulate_crop_shift(request)
        return CropShiftResponse(result=result, generated_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))