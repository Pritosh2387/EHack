import { apiRequest } from './client';
import type { CropShiftRequest, CropShiftResponse } from '../types/api';

export async function simulateCropShift(data: CropShiftRequest): Promise<CropShiftResponse> {
  return apiRequest<CropShiftResponse>('/api/v1/scenarios/crop-shift', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
