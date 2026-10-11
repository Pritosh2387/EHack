import { useQuery } from '@tanstack/react-query';
import { fetchDataStatus } from '../api/dataStatus';
import type { DataStatusResponse } from '../types/api';

/**
 * Shared authoritative hook for fetching and caching dataset ingestion status.
 */
export function useDataStatus() {
  return useQuery<DataStatusResponse>({
    queryKey: ['data-status'],
    queryFn: fetchDataStatus,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });
}

/**
 * Normalizes backend dataset status flags:
 * 'ready' / 'available' -> all four supplied starter datasets loaded and validated.
 */
export function isDatasetReady(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'ready' || s === 'available';
}

/**
 * 'partial' / 'partially_available' -> some datasets loaded, others missing or invalid.
 */
export function isDatasetPartial(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'partial' || s === 'partially_available' || s === 'partially-available';
}

/**
 * 'unavailable' -> no usable datasets loaded.
 */
export function isDatasetUnavailable(status?: string): boolean {
  if (!status) return true;
  const s = status.toLowerCase();
  return s === 'unavailable';
}
