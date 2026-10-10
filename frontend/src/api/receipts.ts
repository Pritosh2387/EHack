import { apiRequest } from './client';
import type { ReceiptRequest, ReceiptResponse } from '../types/api';

/**
 * Creates a traceable decision receipt.
 * Explicitly preserves the required trailing slash as defined in the FastAPI router.
 */
export async function createDecisionReceipt(data: ReceiptRequest): Promise<ReceiptResponse> {
  return apiRequest<ReceiptResponse>('/api/v1/receipts/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
