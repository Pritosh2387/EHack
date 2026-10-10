import { apiRequest } from './client';
import type { DataStatusResponse } from '../types/api';

export async function fetchDataStatus(): Promise<DataStatusResponse> {
  return apiRequest<DataStatusResponse>('/api/v1/data-status');
}
