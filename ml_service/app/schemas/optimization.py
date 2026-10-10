from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class OptimizationRequest(BaseModel):
    region: str
    objective: str = "minimize_blue_water"  # minimize_blue_water, maximize_production, etc.
    time_period: str = "2020-21"
    constraints: Optional[Dict[str, Any]] = None

class OptimizationResult(BaseModel):
    region: str
    objective: str
    time_period: str
    baseline_allocation: Dict[str, float]
    optimized_allocation: Dict[str, float]
    baseline_blue_water_demand: Optional[float] = None
    optimized_blue_water_demand: Optional[float] = None
    water_demand_difference: Optional[float] = None
    water_demand_difference_percent: Optional[float] = None
    baseline_production: Optional[float] = None
    optimized_production: Optional[float] = None
    production_difference: Optional[float] = None
    production_difference_percent: Optional[float] = None
    solver_used: str
    solver_status: str
    feasibility_status: str
    calculation_methodology: str
    data_sources: List[str]
    provenance: dict
    assumptions: List[str]
    limitations: List[str]

class OptimizationResponse(BaseModel):
    result: OptimizationResult
    generated_at: datetime