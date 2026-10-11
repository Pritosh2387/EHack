import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { DatasetStatusCard } from '../components/feedback/DatasetStatusCard';
import { DatasetTable, type DatasetTableItem } from '../components/tables/DatasetTable';
import { isDatasetReady, isDatasetPartial, isDatasetUnavailable } from '../hooks/useDataStatus';

describe('Data Status Mapping & Visual Indicators', () => {
  it('correctly classifies status values into ready, partial, unavailable', () => {
    // Ready
    expect(isDatasetReady('ready')).toBe(true);
    expect(isDatasetReady('available')).toBe(true);
    expect(isDatasetReady('partial')).toBe(false);
    expect(isDatasetReady('unavailable')).toBe(false);
    expect(isDatasetReady(undefined)).toBe(false);

    // Partial
    expect(isDatasetPartial('partial')).toBe(true);
    expect(isDatasetPartial('partially_available')).toBe(true);
    expect(isDatasetPartial('partially-available')).toBe(true);
    expect(isDatasetPartial('ready')).toBe(false);
    expect(isDatasetPartial('unavailable')).toBe(false);

    // Unavailable
    expect(isDatasetUnavailable('unavailable')).toBe(true);
    expect(isDatasetUnavailable(undefined)).toBe(true);
    expect(isDatasetUnavailable('ready')).toBe(false);
    expect(isDatasetUnavailable('partial')).toBe(false);
  });

  it('renders StatusBadge with emerald styles for ready and amber for partial', () => {
    const { container: cReady } = render(<StatusBadge status="ready" label="Starter Datasets Loaded" />);
    expect(screen.getByText('Starter Datasets Loaded')).toBeInTheDocument();
    expect(cReady.firstChild).toHaveClass('bg-emerald-50');

    const { container: cPartial } = render(<StatusBadge status="partial" label="Partially Loaded" />);
    expect(screen.getByText('Partially Loaded')).toBeInTheDocument();
    expect(cPartial.firstChild).toHaveClass('bg-amber-50');

    const { container: cUnavail } = render(<StatusBadge status="unavailable" label="Awaiting File Ingestion" />);
    expect(screen.getByText('Awaiting File Ingestion')).toBeInTheDocument();
    expect(cUnavail.firstChild).toHaveClass('bg-red-50');

    const { container: cLoading } = render(<StatusBadge status="loading" label="Checking Status..." />);
    expect(screen.getByText('Checking Status...')).toBeInTheDocument();
    expect(cLoading.firstChild).toHaveClass('bg-blue-50');
  });

  it('renders DatasetStatusCard with exact row count and coverage scope', () => {
    render(
      <DatasetStatusCard
        name="agricultural_exports"
        available={true}
        source="Ministry of Commerce and Industry"
        description="India's agricultural export statistics"
        period="2024-25"
        geographicScope="National (India)"
        rowCount={3}
        coverageNotes="APEDA 2024-25 aggregate subset (3 commodities)"
      />
    );

    expect(screen.getByText(/agricultural exports/i)).toBeInTheDocument();
    expect(screen.getByText('Loaded')).toBeInTheDocument();
    expect(screen.getByText('3 rows')).toBeInTheDocument();
    expect(screen.getByText('3 loaded')).toBeInTheDocument();
    expect(screen.getByText(/APEDA 2024-25 aggregate subset/)).toBeInTheDocument();
  });

  it('renders DatasetStatusCard with pending state and validation errors when unavailable', () => {
    render(
      <DatasetStatusCard
        name="crop_production"
        available={false}
        source="DES Agriculture"
        rowCount={0}
        errors={['Missing column: yield', 'Invalid year format']}
      />
    );

    expect(screen.getByText(/crop production/i)).toBeInTheDocument();
    expect(screen.getByText('Pending File')).toBeInTheDocument();
    expect(screen.getByText('Pending ingestion')).toBeInTheDocument();
    expect(screen.getByText('Missing column: yield')).toBeInTheDocument();
    expect(screen.getByText('Invalid year format')).toBeInTheDocument();
  });

  it('renders DatasetTable with accurate row count column and status badges', () => {
    const mockDatasets: DatasetTableItem[] = [
      {
        name: 'agricultural_exports',
        description: 'Export statistics',
        source: 'APEDA',
        period: '2024-25',
        geographic_coverage: 'National',
        units: { quantity: 'tonnes' },
        columns: ['hs_code', 'commodity_description'],
        available: true,
        row_count: 3,
      },
      {
        name: 'crop_water_footprint',
        description: 'Water footprint coefficients',
        source: 'Mekonnen & Hoekstra',
        period: '1996-2005',
        geographic_coverage: 'Global',
        units: { green: 'm3/tonne' },
        columns: ['crop_or_product', 'green_water'],
        available: true,
        row_count: 20,
      },
      {
        name: 'groundwater_assessment',
        description: 'GW assessment units',
        source: 'CGWB',
        period: '2022',
        geographic_coverage: 'Punjab',
        units: { assessment_unit: 'ID' },
        columns: ['assessment_unit_id'],
        available: false,
        row_count: 0,
      },
    ];

    render(<DatasetTable datasets={mockDatasets} />);

    expect(screen.getByText('3 rows')).toBeInTheDocument();
    expect(screen.getByText('20 rows')).toBeInTheDocument();
    expect(screen.getAllByText('Ready')).toHaveLength(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
