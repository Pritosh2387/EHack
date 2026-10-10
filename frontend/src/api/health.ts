import { apiRequest } from './client';
import type { HealthResponse } from '../types/api';

export async function fetchHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}
