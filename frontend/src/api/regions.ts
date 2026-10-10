import { apiRequest } from './client';
import type {
  CropProductionResponse,
  GroundwaterStressResponse,
  RegionsOverviewResponse,
} from '../types/api';

export interface CropProductionParams {
  state?: string | null;
  district?: string | null;
  crop?: string | null;
  year?: string | null;
}

export interface GroundwaterStressParams {
  state?: string | null;
  district?: string | null;
  category?: string | null;
  year?: string | number | null;
}

export interface RegionsOverviewParams {
  state?: string | null;
  year?: string | null;
  groundwater_year?: string | null;
}

export async function fetchCropProduction(params: CropProductionParams = {}): Promise<CropProductionResponse> {
  return apiRequest<CropProductionResponse>('/api/v1/regions/crop-production', {
    params: {
      state: params.state || undefined,
      district: params.district || undefined,
      crop: params.crop || undefined,
      year: params.year || undefined,
    },
  });
}

export async function fetchGroundwaterStress(params: GroundwaterStressParams = {}): Promise<GroundwaterStressResponse> {
  return apiRequest<GroundwaterStressResponse>('/api/v1/regions/groundwater-stress', {
    params: {
      state: params.state || undefined,
      district: params.district || undefined,
      category: params.category || undefined,
      year: params.year ? String(params.year) : undefined,
    },
  });
}

export async function fetchRegionsOverview(params: RegionsOverviewParams = {}): Promise<RegionsOverviewResponse> {
  return apiRequest<RegionsOverviewResponse>('/api/v1/regions/overview', {
    params: {
      state: params.state || undefined,
      year: params.year || undefined,
      groundwater_year: params.groundwater_year || undefined,
    },
  });
}
