/**
 * Core API Client for Water Shadow
 * Handles URL building, JSON encoding, HTTP error parsing, and timeout/abort signals.
 */


const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class ApiClientError extends Error {
  status: number;
  detail: any;
  isNetworkError: boolean;

  constructor(message: string, status = 0, detail: any = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
    this.isNetworkError = isNetworkError;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, timeoutMs = 15000, ...fetchOptions } = options;

  // Build target URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${normalizedEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Abort controller with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options.signal || controller.signal;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON or text
    let data: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `API Error (${response.status}): ${response.statusText}`;
      if (typeof data === 'object' && data !== null) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }
      throw new ApiClientError(errorMessage, response.status, data, false);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new ApiClientError('Request timed out or was cancelled', 408, null, true);
    }
    throw new ApiClientError(
      err.message || 'Unable to connect to Water Shadow analytics service. Please verify the backend is running.',
      0,
      null,
      true
    );
  }
}
