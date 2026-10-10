import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, ApiClientError } from '../api/client';

describe('API Client Layer (Section 14)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds URL, serializes parameters and parses JSON correctly', async () => {
    const mockData = { status: 'healthy', version: '0.1.0' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    });

    const res = await apiRequest('/health', {
      params: { test_param: 'hello', empty_param: undefined },
    });

    expect(res).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health?test_param=hello'),
      expect.anything()
    );
  });

  it('detects HTTP errors and normalizes error messages', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Real dataset is unavailable or failed validation.' }),
    });

    await expect(apiRequest('/api/v1/exports/ledger')).rejects.toThrow(
      'Real dataset is unavailable or failed validation.'
    );
  });

  it('handles network failure gracefully without creating fake success', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(apiRequest('/health')).rejects.toThrow();
  });
});
