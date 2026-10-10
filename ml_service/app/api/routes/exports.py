from fastapi import APIRouter, HTTPException, Query
from ml_service.app.schemas.exports import ExportFootprintRequest, ExportLedgerResponse
from ml_service.app.services.export_analytics_service import ExportAnalyticsService

router = APIRouter()
export_service = ExportAnalyticsService()

@router.get("/ledger", response_model=ExportLedgerResponse)
async def get_exports_ledger(
    crop: str = Query(..., description="Crop to analyze"),
    financial_year: str = Query(None, description="Financial year (e.g., 2020-21)"),
    water_component: str = Query("all", description="Water component: green, blue, grey, or all")
):
    try:
        request = ExportFootprintRequest(
            crop=crop,
            financial_year=financial_year,
            water_component=water_component
        )
        return export_service.get_exports_ledger(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))