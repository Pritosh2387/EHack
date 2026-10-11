import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExportFootprintPage } from '../pages/ExportFootprintPage';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockFiltersResponse = {
  financial_years: ['2024-25'],
  commodities: ['rice', 'wheat'],
  default_financial_year: '2024-25',
  default_commodity: 'rice',
  available: true,
  export_categories: ['non-basmati rice', 'basmati rice', 'wheat'],
};

const mockDataStatusResponse = {
  overall_status: 'ready',
  datasets: [],
  missing_requirements: [],
  unsupported_calculations: [],
  join_coverage: {
    export_years: ['2024-25'],
    export_commodities: ['non-basmati rice', 'basmati rice', 'wheat'],
  },
  last_updated: '2026-10-11',
};

const mockRiceLedgerResponse = {
  results: [
    {
      crop: 'non-basmati rice',
      financial_year: '2024-25',
      export_quantity: 14128955,
      export_quantity_unit: 'tonnes',
      export_value: 6528000,
      export_value_currency: 'USD',
      green_water_coefficient: 1146,
      blue_water_coefficient: 341,
      grey_water_coefficient: 187,
      coefficient_unit: 'm³/tonne',
      estimated_green_water: 16191782430,
      estimated_blue_water: 4817973655,
      estimated_grey_water: 2642114585,
      total_water_footprint: 23651870670,
      footprint_unit: 'm³',
      calculation_methodology: 'Export quantity (tonnes) × Water footprint coefficient (m³/tonne)',
      data_sources: ['APEDA Annual Report 2024-25', 'Mekonnen & Hoekstra (2011)'],
      provenance: { export_data: 'OBSERVED', water_coefficients: 'PUBLISHED_REAL_ARTICLE_SOURCED', calculation: 'INFERRED' },
      limitations: [
        'Water footprint coefficients are published global historical estimates (1996-2005)',
        'Grey water footprint represents theoretical assimilation/dilution volume',
        'National agricultural export trade statistics cannot be attributed to a specific state or district aquifer',
      ],
    },
    {
      crop: 'basmati rice',
      financial_year: '2024-25',
      export_quantity: 6065456,
      export_quantity_unit: 'tonnes',
      export_value: 5944000,
      export_value_currency: 'USD',
      green_water_coefficient: 1146,
      blue_water_coefficient: 341,
      grey_water_coefficient: 187,
      coefficient_unit: 'm³/tonne',
      estimated_green_water: 6951012576,
      estimated_blue_water: 2068320496,
      estimated_grey_water: 1134240272,
      total_water_footprint: 10153573344,
      footprint_unit: 'm³',
      calculation_methodology: 'Export quantity (tonnes) × Water footprint coefficient (m³/tonne)',
      data_sources: ['APEDA Annual Report 2024-25', 'Mekonnen & Hoekstra (2011)'],
      provenance: { export_data: 'OBSERVED', water_coefficients: 'PUBLISHED_REAL_ARTICLE_SOURCED', calculation: 'INFERRED' },
      limitations: [
        'Water footprint coefficients are published global historical estimates (1996-2005)',
        'Grey water footprint represents theoretical assimilation/dilution volume',
        'National agricultural export trade statistics cannot be attributed to a specific state or district aquifer',
      ],
    },
  ],
  count: 2,
  filters_applied: { crop: 'rice', financial_year: '2024-25', water_component: 'all' },
  generated_at: '2026-10-11T12:00:00Z',
};

const mockWheatLedgerResponse = {
  results: [
    {
      crop: 'wheat',
      financial_year: '2024-25',
      export_quantity: 3566,
      export_quantity_unit: 'tonnes',
      export_value: 2000,
      export_value_currency: 'USD',
      green_water_coefficient: 1277,
      blue_water_coefficient: 342,
      grey_water_coefficient: 207,
      coefficient_unit: 'm³/tonne',
      estimated_green_water: 4553782,
      estimated_blue_water: 1219572,
      estimated_grey_water: 738162,
      total_water_footprint: 6511516,
      footprint_unit: 'm³',
      calculation_methodology: 'Export quantity (tonnes) × Water footprint coefficient (m³/tonne)',
      data_sources: ['APEDA Annual Report 2024-25', 'Mekonnen & Hoekstra (2011)'],
      provenance: { export_data: 'OBSERVED', water_coefficients: 'PUBLISHED_REAL_ARTICLE_SOURCED', calculation: 'INFERRED' },
      limitations: [
        'Water footprint coefficients are published global historical estimates (1996-2005)',
        'Grey water footprint represents theoretical assimilation/dilution volume',
      ],
    },
  ],
  count: 1,
  filters_applied: { crop: 'wheat', financial_year: '2024-25', water_component: 'all' },
  generated_at: '2026-10-11T12:00:00Z',
};

describe('ExportFootprintPage End-to-End Visual & Behavioral Verification', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('populates dynamic filters with FY 2024-25 and compatible crops without unsupported options', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes('/health')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'healthy', version: '0.1.0', service: 'ml-service' }),
        };
      }
      if (u.includes('/api/v1/exports/filters')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockFiltersResponse,
        };
      }
      if (u.includes('/api/v1/data-status')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockDataStatusResponse,
        };
      }
      if (u.includes('/api/v1/exports/ledger')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockRiceLedgerResponse,
        };
      }
      return {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      };
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExportFootprintPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify national level analytics scope disclaimer is present
    expect(screen.getByText(/National Level Analytics Scope:/i)).toBeInTheDocument();

    // Verify commodity filter has Rice and Wheat, but does not list unsupported crops
    await waitFor(() => {
      expect(screen.getByText('Rice (Basmati & Non-Basmati)')).toBeInTheDocument();
      expect(screen.getByText('Wheat')).toBeInTheDocument();
    });
    expect(screen.queryByText('Sugarcane')).not.toBeInTheDocument();
    expect(screen.queryByText('Cotton')).not.toBeInTheDocument();

    // Verify financial year dropdown contains FY 2024-25 and does NOT offer 2020-21 or 2019-20
    expect(screen.getByText('FY 2024-25')).toBeInTheDocument();
    expect(screen.queryByText('2020-21')).not.toBeInTheDocument();
    expect(screen.queryByText('2019-20')).not.toBeInTheDocument();

    // Verify successful data presentation for Rice (2 categories)
    await waitFor(() => {
      expect(screen.getByText('Detailed Export Ledger Results')).toBeInTheDocument();
      expect(screen.getAllByText(/Non.*Basmati Rice/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Basmati Rice/i).length).toBeGreaterThan(0);
    });

    // Verify total export quantity across both categories is rendered
    expect(screen.getByText('Export Quantity (2 categories)')).toBeInTheDocument();
  });

  it('switches to Wheat and updates table and metric cards', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes('/health')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'healthy', version: '0.1.0' }),
        };
      }
      if (u.includes('/api/v1/exports/filters')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockFiltersResponse,
        };
      }
      if (u.includes('/api/v1/data-status')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockDataStatusResponse,
        };
      }
      if (u.includes('crop=wheat')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockWheatLedgerResponse,
        };
      }
      return {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockRiceLedgerResponse,
      };
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExportFootprintPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Non.*Basmati Rice/i).length).toBeGreaterThan(0);
    });

    // Select Wheat in the commodity dropdown
    const selectElements = screen.getAllByRole('combobox');
    const cropSelect = selectElements[0];
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });

    // Click Apply Filters
    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Wheat')).toBeInTheDocument();
      expect(screen.queryByText(/Non.*Basmati Rice/i)).not.toBeInTheDocument();
    });
  });

  it('renders clean EmptyState without a red error banner when query yields zero results', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes('/api/v1/exports/filters')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockFiltersResponse,
        };
      }
      if (u.includes('/api/v1/exports/ledger')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            results: [],
            count: 0,
            filters_applied: { crop: 'rice', financial_year: '2020-21', water_component: 'all' },
            generated_at: '2026-10-11T12:00:00Z',
            message: 'No export data found for crop: rice in financial year: 2020-21. Loaded export dataset contains records for FY: 2024-25.',
          }),
        };
      }
      return {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      };
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExportFootprintPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Export Records Returned')).toBeInTheDocument();
    });

    // Must NOT display misleading missing dataset banner or error notice
    expect(screen.queryByText(/Real agricultural exports dataset or crop water footprint dataset is unavailable/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Export Analytics Service Notice')).not.toBeInTheDocument();
  });

  it('handles water-component-specific selection cleanly', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes('/health')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'healthy', version: '0.1.0' }),
        };
      }
      if (u.includes('/api/v1/data-status')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockDataStatusResponse,
        };
      }
      if (u.includes('/api/v1/exports/filters')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockFiltersResponse,
        };
      }
      if (u.includes('water_component=green')) {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            results: [
              {
                ...mockWheatLedgerResponse.results[0],
                green_water_coefficient: 1277,
                blue_water_coefficient: null,
                grey_water_coefficient: null,
                estimated_green_water: 4553782,
                estimated_blue_water: null,
                estimated_grey_water: null,
              },
            ],
            count: 1,
            filters_applied: { crop: 'wheat', financial_year: '2024-25', water_component: 'green' },
            generated_at: '2026-10-11T12:00:00Z',
          }),
        };
      }
      return {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockWheatLedgerResponse,
      };
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExportFootprintPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Apply Filters/i })).toBeInTheDocument();
    });

    // Select Green Water Only in water component dropdown
    const selectElements = screen.getAllByRole('combobox');
    const waterSelect = selectElements[2];
    fireEvent.change(waterSelect, { target: { value: 'green' } });

    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getAllByText('Excluded by water component filter').length).toBeGreaterThan(0);
    });
  });
});
