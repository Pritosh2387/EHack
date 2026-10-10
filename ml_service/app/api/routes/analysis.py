from fastapi import APIRouter, HTTPException
from ml_service.app.schemas.analysis import SensitivityRequest, SensitivityResponse, ExplainRequest, ExplainResponse
from ml_service.app.services.sensitivity_analysis_service import SensitivityAnalysisService
from ml_service.app.services.explanation_engine_service import ExplanationEngineService
from datetime import datetime

router = APIRouter()
sensitivity_service = SensitivityAnalysisService()
explanation_service = ExplanationEngineService()

@router.post("/sensitivity", response_model=SensitivityResponse)
async def run_sensitivity_analysis(request: SensitivityRequest):
    try:
        result = sensitivity_service.run_sensitivity_analysis(request)
        return SensitivityResponse(result=result, generated_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/explain", response_model=ExplainResponse)
async def explain_analysis(request: ExplainRequest):
    try:
        result = explanation_service.generate_explanation(request)
        return ExplainResponse(explanation=result, generated_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))