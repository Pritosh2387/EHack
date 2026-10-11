import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { formatNumber } from '../utils/formatters';
import { RegionalExplorerPage } from '../pages/RegionalExplorerPage';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const jsonResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
  text: async () => JSON.stringify(data),
});

const mockFiltersResponse = {
  production_states: ['Punjab', 'Uttar Pradesh', 'Haryana'],
  groundwater_states: ['Punjab'],
  overlapping_states: ['Punjab'],
  crop_years: ['2024-25', '2023-24'],
  groundwater_years: ['2022'],
  crops: ['rice', 'wheat'],
  crops_by_state: {
    Punjab: ['rice', 'wheat'],
    'Uttar Pradesh': ['rice', 'wheat'],
    Haryana: ['wheat'],
  },
  districts_by_state: {
    Punjab: ['Ludhiana'],
  },
  default_state: 'Punjab',
  default_crop: 'rice',
  default_crop_year: '2023-24',
  default_groundwater_year: '2022',
  available: true,
};

const mockPunjabRiceCropResponse = {
  results: [
    {
      state: 'Punjab',
      district: null,
      crop: 'rice',
      year: '2023-24',
      area: 3180000.0,
      area_unit: 'hectares',
      production: 14360000.0,
      production_unit: 'tonnes',
      yield_: 4.516,
      yield_unit: 'tonnes/hectare',
      data_source: 'Ministry of Agriculture and Farmers Welfare',
      provenance: { area_data: 'OBSERVED', production_data: 'OBSERVED' },
      limitations: [],
    },
  ],
  count: 1,
  filters_applied: { state: 'Punjab', crop: 'rice', year: '2023-24' },
  generated_at: '2026-10-11T12:00:00Z',
};

const mockPunjabGwResponse = {
  assessment_units: [
    {
      assessment_unit_id: 'PB-LUDHIANA-JAGRAON-2022',
      state: 'Punjab',
      district: 'Ludhiana',
      category: 'Over-Exploited',
      year: 2022,
    },
    {
      assessment_unit_id: 'PB-LUDHIANA-KHANNA-2022',
      state: 'Punjab',
      district: 'Ludhiana',
      category: 'Over-Exploited',
      year: 2022,
    },
    {
      assessment_unit_id: 'PB-LUDHIANA-LUDHIANA-CITY-URBAN-2022',
      state: 'Punjab',
      district: 'Ludhiana',
      category: 'Over-Exploited',
      year: 2022,
    },
    {
      assessment_unit_id: 'PB-LUDHIANA-LUDHIANA-1-2022',
      state: 'Punjab',
      district: 'Ludhiana',
      category: 'Over-Exploited',
      year: 2022,
    },
    {
      assessment_unit_id: 'PB-LUDHIANA-LUDHIANA-2-2022',
      state: 'Punjab',
      district: 'Ludhiana',
      category: 'Over-Exploited',
      year: 2022,
    },
  ],
  summary: {
    total_units: 5,
    safe: 0,
    semi_critical: 0,
    critical: 0,
    over_exploited: 5,
    saline: 0,
  },
  data_source: 'Central Ground Water Board (CGWB)',
  provenance: { assessment_data: 'OBSERVED' },
  limitations: [],
  filters_applied: { state: 'Punjab', year: '2022' },
  last_updated: '2026-10-11',
  data_availability: { real_data_parsed_and_usable: true, validation_errors: [] },
};

const mockUPRiceCropResponse = {
  results: [
    {
      state: 'Uttar Pradesh',
      district: null,
      crop: 'rice',
      year: '2023-24',
      area: 5770000.0,
      area_unit: 'hectares',
      production: 15990000.0,
      production_unit: 'tonnes',
      yield_: 2.772,
      yield_unit: 'tonnes/hectare',
      data_source: 'Ministry of Agriculture and Farmers Welfare',
      provenance: { area_data: 'OBSERVED', production_data: 'OBSERVED' },
      limitations: [],
    },
  ],
  count: 1,
  filters_applied: { state: 'Uttar Pradesh', crop: 'rice', year: '2023-24' },
  generated_at: '2026-10-11T12:00:00Z',
};

const mockEmptyGwResponse = {
  assessment_units: [],
  summary: {
    total_units: 0,
    safe: 0,
    semi_critical: 0,
    critical: 0,
    over_exploited: 0,
    saline: 0,
  },
  data_source: 'Central Ground Water Board (CGWB)',
  provenance: { assessment_data: 'UNAVAILABLE' },
  limitations: [],
  filters_applied: {},
  last_updated: '2026-10-11',
  data_availability: { real_data_parsed_and_usable: false, validation_errors: [] },
};

describe('RegionalExplorerPage Integration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/health')) {
        return jsonResponse({ status: 'healthy', version: '0.1.0', service: 'ml-service' });
      }

      if (url.includes('/api/v1/data-status')) {
        return jsonResponse({
          overall_status: 'ready',
          datasets: [],
          missing_requirements: [],
          unsupported_calculations: [],
          join_coverage: {},
          last_updated: '2026-10-11',
        });
      }

      if (url.includes('/api/v1/regions/filters')) {
        return jsonResponse(mockFiltersResponse);
      }

      if (url.includes('/api/v1/regions/crop-production')) {
        if (url.includes('state=Uttar+Pradesh') || url.includes('state=Uttar%20Pradesh')) {
          return jsonResponse(mockUPRiceCropResponse);
        }
        if (url.includes('district=')) {
          return jsonResponse({ results: [], count: 0, filters_applied: {}, generated_at: '2026-10-11' });
        }
        return jsonResponse(mockPunjabRiceCropResponse);
      }

      if (url.includes('/api/v1/regions/groundwater-stress')) {
        if (url.includes('state=Uttar+Pradesh') || url.includes('state=Uttar%20Pradesh')) {
          return jsonResponse(mockEmptyGwResponse);
        }
        return jsonResponse(mockPunjabGwResponse);
      }

      return jsonResponse({});
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders initial load with dataset-backed defaults and real values', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegionalExplorerPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Header and Disclaimer
    expect(screen.getByText('Regional Water & Agriculture Explorer')).toBeInTheDocument();
    expect(screen.getByText(/Official Hydrogeological Disclaimer/i)).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('PB-LUDHIANA-JAGRAON-2022')).toBeInTheDocument();
    });

    // Metric cards verification
    expect(screen.getByText('Assessed Units')).toBeInTheDocument();
    expect(screen.getByText('Safe Units')).toBeInTheDocument();
    expect(screen.getByText('Critical / Over-Exploited')).toBeInTheDocument();
    expect(screen.getByText('Crop Production Volume')).toBeInTheDocument();

    // Groundwater units = 5
    const unitBadges = screen.getAllByText('5');
    expect(unitBadges.length).toBeGreaterThanOrEqual(1);

    // Production volume formatted
    expect(screen.getAllByText(formatNumber(14360000)).length).toBeGreaterThanOrEqual(1);

    // Table rows
    expect(screen.getByText('PB-LUDHIANA-KHANNA-2022')).toBeInTheDocument();
    expect(screen.getByText('PB-LUDHIANA-LUDHIANA-CITY-URBAN-2022')).toBeInTheDocument();
  });

  it('populates reporting years and commodities matching loaded datasets', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegionalExplorerPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('PB-LUDHIANA-JAGRAON-2022')).toBeInTheDocument();
    });

    // Crop reporting year choices: 2024-25, 2023-24 (NOT 2020-21)
    expect(screen.getByRole('option', { name: '2024-25' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2023-24' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '2020-21' })).not.toBeInTheDocument();

    // Groundwater year choices: 2022 (NOT 2020 or 2023)
    expect(screen.getByRole('option', { name: '2022' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '2020' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '2023' })).not.toBeInTheDocument();
  });

  it('explicitly reports unavailable groundwater data when selecting state without GW records', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegionalExplorerPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('PB-LUDHIANA-JAGRAON-2022')).toBeInTheDocument();
    });

    // Wait until FilterPanel is ready (Apply Filters button present)
    const applyBtn = await screen.findByRole('button', { name: /Apply Filters/i });

    // Switch state to Uttar Pradesh
    const stateSelects = screen.getAllByRole('combobox');
    const stateSelect = stateSelects[0];
    fireEvent.change(stateSelect, { target: { value: 'Uttar Pradesh' } });

    fireEvent.click(applyBtn);

    // Check that groundwater metric is marked unavailable with explanatory reason (no false zero)
    // and check crop production volume for UP is displayed
    await waitFor(() => {
      expect(
        screen.getAllByText(/Groundwater assessment not loaded for Uttar Pradesh/i).length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText(formatNumber(15990000)).length).toBeGreaterThanOrEqual(1);
    });

    // Groundwater table empty message
    expect(
      screen.getByText(/Groundwater assessment data is not loaded for Uttar Pradesh/i)
    ).toBeInTheDocument();
  });

  it('handles optional district filter with clear state-level explanation', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegionalExplorerPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('PB-LUDHIANA-JAGRAON-2022')).toBeInTheDocument();
    });

    const applyBtn = await screen.findByRole('button', { name: /Apply Filters/i });
    const districtInput = screen.getByPlaceholderText('e.g. Ludhiana');
    fireEvent.change(districtInput, { target: { value: 'Ludhiana' } });

    fireEvent.click(applyBtn);

    // Crop production card displays district notice
    await waitFor(() => {
      expect(
        screen.getAllByText(/District-level crop production is not available in loaded dataset/i).length
      ).toBeGreaterThan(0);
    });

    // Crop table displays explanatory notice
    expect(
      screen.getByText(/The loaded agricultural statistics dataset contains official state-level totals only/i)
    ).toBeInTheDocument();
  });

  it('resets filters back to defaults on Reset click', async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegionalExplorerPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('PB-LUDHIANA-JAGRAON-2022')).toBeInTheDocument();
    });

    const resetBtn = await screen.findByRole('button', { name: /Reset/i });
    const districtInput = screen.getByPlaceholderText('e.g. Ludhiana');
    fireEvent.change(districtInput, { target: { value: 'Ludhiana' } });

    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect((districtInput as HTMLInputElement).value).toBe('');
      expect(screen.getAllByText(formatNumber(14360000)).length).toBeGreaterThanOrEqual(1);
    });
  });
});
