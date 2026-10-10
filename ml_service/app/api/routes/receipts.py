from fastapi import APIRouter, HTTPException
from ml_service.app.schemas.receipts import ReceiptRequest, ReceiptResponse
from ml_service.app.services.receipt_builder_service import ReceiptBuilderService
import uuid
from datetime import datetime

router = APIRouter()
receipt_service = ReceiptBuilderService()

@router.post("/", response_model=ReceiptResponse)
async def create_receipt(request: ReceiptRequest):
    try:
        receipt = receipt_service.build_receipt(request)
        return receipt
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))