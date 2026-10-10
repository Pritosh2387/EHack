from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetInfo(BaseModel):
    name: str
    description: str
    source: str
    period: str
    geographic_coverage: str
    units: Dict[str, str]
    columns: List[str]
    available: bool

class MetadataResponse(BaseModel):
    version: str
    description: str
    datasets: List[DatasetInfo]
    supported_crops: List[str]
    supported_regions: List[str]
    supported_analysis_types: List[str]
    units: Dict[str, str]
    methodology_info: Dict[str, Any]