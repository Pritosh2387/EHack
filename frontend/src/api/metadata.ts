import { apiRequest } from './client';
import type { MetadataResponse } from '../types/api';

export async function fetchMetadata(): Promise<MetadataResponse> {
  return apiRequest<MetadataResponse>('/api/v1/metadata');
}
