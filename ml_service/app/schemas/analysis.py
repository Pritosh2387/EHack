from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SensitivityRequest(BaseModel):
    analysis_type: str  # export_water_footprint, crop_shift, etc.
    parameter_to_vary: str  # e.g., "yield", "water_coefficient", "area"
    baseline_value: float
    variation_percent: float = 10.0  # ±10% by default
    steps: int = 5  # number of steps in each direction

class SensitivityResult(BaseModel):
    parameter_name: str
    baseline_value: float
    variation_percent: float
    results: List[Dict[str, Any]]  # Each step with input value and output metrics
    analysis_type: str
    methodology: str

class SensitivityResponse(BaseModel):
    result: SensitivityResult
    generated_at: datetime

class ExplainRequest(BaseModel):
    analysis_type: str
    analysis_id: Optional[str] = None
    parameters: Dict[str, Any]

class ExplainResponse(BaseModel):
    explanation: Dict[str, Any]
    generated_at: datetime