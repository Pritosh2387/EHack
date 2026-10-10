from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ExportFootprintRequest(BaseModel):
    crop: str
    financial_year: Optional[str] = None
    water_component: Optional[str] = None  # green, blue, grey, or all

class ExportFootprintResult(BaseModel):
    crop: str
    financial_year: str
    export_quantity: float
    export_quantity_unit: str
    green_water_coefficient: Optional[float] = None
    blue_water_coefficient: Optional[float] = None
    grey_water_coefficient: Optional[float] = None
    coefficient_unit: str
    estimated_green_water: Optional[float] = None
    estimated_blue_water: Optional[float] = None
    estimated_grey_water: Optional[float] = None
    total_water_footprint: Optional[float] = None
    footprint_unit: str
    calculation_methodology: str
    data_sources: List[str]
    provenance: dict
    limitations: List[str]
    warning: Optional[str] = None

class ExportLedgerResponse(BaseModel):
    results: List[ExportFootprintResult]
    count: int
    filters_applied: dict
    generated_at: datetime