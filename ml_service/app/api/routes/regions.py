from fastapi import APIRouter, HTTPException, Query
from ml_service.app.schemas.regions import CropProductionRequest, CropProductionResponse
from ml_service.app.services.crop_production_service import CropProductionService
from ml_service.app.services.groundwater_service import GroundwaterService
from datetime import datetime

router = APIRouter()
crop_production_service = CropProductionService()
groundwater_service = GroundwaterService()

@router.get("/crop-production", response_model=CropProductionResponse)
async def get_crop_production(
    state: str = Query(None, description="State name"),
    district: str = Query(None, description="District name"),
    crop: str = Query(None, description="Crop name"),
    year: str = Query(None, description="Year (e.g., 2020-21)")
):
    try:
        request = CropProductionRequest(
            state=state,
            district=district,
            crop=crop,
            year=year
        )
        return crop_production_service.get_crop_production(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/groundwater-stress")
async def get_groundwater_stress(
    state: str = Query(None, description="State name"),
    district: str = Query(None, description="District name"),
    category: str = Query(None, description="Groundwater category"),
    year: str = Query(None, description="Year")
):
    try:
        return groundwater_service.get_groundwater_assessment(state, district, category, year)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/overview")
async def get_regions_overview(
    state: str = Query(None, description="State name"),
    year: str = Query(None, description="Year for crop production (e.g., 2020-21)"),
    groundwater_year: str = Query(None, description="Year for groundwater (e.g., 2020)")
):
    try:
        # Get crop production data using its exact reporting period
        crop_request = CropProductionRequest(state=state, year=year)
        crop_data = crop_production_service.get_crop_production(crop_request)

        # Get groundwater assessment data using its exact reporting period
        # If user didn't explicitly provide groundwater_year, we pass None to let the service return all or empty
        gw_data = groundwater_service.get_groundwater_assessment(state, None, None, groundwater_year)

        return {
            "crop_production": crop_data.dict(),
            "groundwater_assessment": gw_data,
            "region": state,
            "year": year,
            "generated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))