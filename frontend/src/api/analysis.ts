import { apiRequest } from './client';
import type {
  SensitivityRequest,
  SensitivityResponse,
  ExplainRequest,
  ExplainResponse,
} from '../types/api';

export async function runSensitivityAnalysis(data: SensitivityRequest): Promise<SensitivityResponse> {
  return apiRequest<SensitivityResponse>('/api/v1/analysis/sensitivity', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function explainAnalysis(data: ExplainRequest): Promise<ExplainResponse> {
  return apiRequest<ExplainResponse>('/api/v1/analysis/explain', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
