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

class RegionalFiltersResponse(BaseModel):
    production_states: List[str]
    groundwater_states: List[str]
    overlapping_states: List[str]
    crop_years: List[str]
    groundwater_years: List[str]
    crops: List[str]
    crops_by_state: dict = {}
    districts_by_state: dict = {}
    default_state: str = "Punjab"
    default_crop: str = "rice"
    default_crop_year: str = "2023-24"
    default_groundwater_year: str = "2022"
    available: bool = True