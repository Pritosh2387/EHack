from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReceiptRequest(BaseModel):
    analysis_type: str
    parameters: Dict[str, Any]
    result_data: Dict[str, Any]

class ReceiptResponse(BaseModel):
    receipt_id: str
    timestamp: datetime
    analysis_type: str
    parameters: Dict[str, Any]
    result_data: Dict[str, Any]
    calculation_methodology: str
    data_sources: List[str]
    provenance: Dict[str, str]
    assumptions: List[str]
    limitations: List[str]
    methodology_version: str
    generated_at: datetime