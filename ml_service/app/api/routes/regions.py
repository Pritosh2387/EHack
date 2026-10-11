from fastapi import APIRouter, HTTPException, Query
from ml_service.app.schemas.regions import CropProductionRequest, CropProductionResponse, RegionalFiltersResponse
from ml_service.app.services.crop_production_service import CropProductionService
from ml_service.app.services.groundwater_service import GroundwaterService
from datetime import datetime

router = APIRouter()
crop_production_service = CropProductionService()
groundwater_service = GroundwaterService()

@router.get("/filters", response_model=RegionalFiltersResponse)
async def get_regional_filters():
    try:
        prod_df = crop_production_service.production_data
        gw_df = groundwater_service.groundwater_data

        prod_states = sorted(prod_df['state'].dropna().unique().tolist()) if not prod_df.empty else []
        gw_states = sorted(gw_df['state'].dropna().unique().tolist()) if not gw_df.empty else []
        overlapping = [s for s in prod_states if s in gw_states]

        crop_years = sorted(prod_df['year'].dropna().astype(str).unique().tolist(), reverse=True) if not prod_df.empty else []
        gw_years = sorted([str(y) for y in gw_df['year'].dropna().unique().tolist()], reverse=True) if not gw_df.empty else []

        crops = sorted(prod_df['crop'].dropna().unique().tolist()) if not prod_df.empty else []

        crops_by_state = {}
        if not prod_df.empty:
            for s in prod_states:
                crops_by_state[s] = sorted(prod_df[prod_df['state'] == s]['crop'].dropna().unique().tolist())

        districts_by_state = {}
        if not gw_df.empty:
            for s in gw_states:
                districts_by_state[s] = sorted(gw_df[gw_df['state'] == s]['district'].dropna().unique().tolist())

        default_state = "Punjab" if "Punjab" in overlapping else (prod_states[0] if prod_states else "Punjab")
        default_crop = "rice" if "rice" in crops else (crops[0] if crops else "rice")
        default_crop_year = "2023-24" if "2023-24" in crop_years else (crop_years[0] if crop_years else "2023-24")
        default_gw_year = "2022" if "2022" in gw_years else (gw_years[0] if gw_years else "2022")

        return RegionalFiltersResponse(
            production_states=prod_states,
            groundwater_states=gw_states,
            overlapping_states=overlapping,
            crop_years=crop_years,
            groundwater_years=gw_years,
            crops=crops,
            crops_by_state=crops_by_state,
            districts_by_state=districts_by_state,
            default_state=default_state,
            default_crop=default_crop,
            default_crop_year=default_crop_year,
            default_groundwater_year=default_gw_year,
            available=crop_production_service.is_real_data or groundwater_service.is_real_data,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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