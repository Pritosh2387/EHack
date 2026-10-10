from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CropProductionRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    crop: Optional[str] = None
    year: Optional[str] = None

class CropProductionResult(BaseModel):
    state: str
    district: Optional[str] = None
    crop: str
    year: str
    area: Optional[float] = None
    area_unit: str = "hectares"
    production: Optional[float] = None
    production_unit: str = "tonnes"
    yield_: Optional[float] = None
    yield_unit: str = "tonnes/hectare"
    data_source: str
    provenance: dict
    limitations: List[str]

class CropProductionResponse(BaseModel):
    results: List[CropProductionResult]
    count: int
    filters_applied: dict
    generated_at: datetime