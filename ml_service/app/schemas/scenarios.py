from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CropShiftRequest(BaseModel):
    region: str
    baseline_crop: str
    alternative_crop: str
    area_hectares: float
    reference_year: Optional[str] = None
    include_suitability: bool = True

class CropShiftResult(BaseModel):
    region: str
    baseline_crop: str
    alternative_crop: str
    area_hectares: float
    reference_year: Optional[str]
    baseline_yield: Optional[float] = None
    alternative_yield: Optional[float] = None
    yield_unit: str = "tonnes/hectare"
    baseline_blue_water_coefficient: Optional[float] = None
    alternative_blue_water_coefficient: Optional[float] = None
    coefficient_unit: str = "m³/tonne"
    baseline_demand: Optional[float] = None
    alternative_demand: Optional[float] = None
    absolute_difference: Optional[float] = None
    percentage_difference: Optional[float] = None
    difference_unit: str = "m³"
    calculation_methodology: str
    data_sources: List[str]
    provenance: dict
    agronomic_suitability: dict
    assumptions: List[str]
    limitations: List[str]

class CropShiftResponse(BaseModel):
    result: CropShiftResult
    generated_at: datetime