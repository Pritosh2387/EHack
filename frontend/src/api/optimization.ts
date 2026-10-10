import { apiRequest } from './client';
import type { OptimizationRequest, OptimizationResponse } from '../types/api';

export async function optimizeCropAllocation(data: OptimizationRequest): Promise<OptimizationResponse> {
  return apiRequest<OptimizationResponse>('/api/v1/optimization/crop-allocation', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
