import { apiRequest } from './client';
import type { ExportLedgerResponse } from '../types/api';

export interface ExportLedgerFilterParams {
  crop: string;
  financial_year?: string | null;
  water_component?: 'all' | 'green' | 'blue' | 'grey' | string;
}

export async function fetchExportsLedger(params: ExportLedgerFilterParams): Promise<ExportLedgerResponse> {
  return apiRequest<ExportLedgerResponse>('/api/v1/exports/ledger', {
    params: {
      crop: params.crop,
      financial_year: params.financial_year || undefined,
      water_component: params.water_component || 'all',
    },
  });
}
