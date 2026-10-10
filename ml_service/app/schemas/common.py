from pydantic import BaseModel
from typing import List, Optional

class HealthResponse(BaseModel):
    status: str
    version: str
    service: str

class DataStatusResponse(BaseModel):
    overall_status: str
    datasets: List[dict]
    missing_requirements: List[str]
    unsupported_calculations: List[str]
    join_coverage: dict
    last_updated: str