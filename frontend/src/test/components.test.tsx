import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { ProvenanceBadge } from '../components/feedback/ProvenanceBadge';
import { MetricCard } from '../components/feedback/MetricCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { LoadingState } from '../components/feedback/LoadingState';

describe('Reusable UI Components (Section 15 & 16)', () => {
  it('renders StatusBadge with correct category styles', () => {
    const { rerender } = render(<StatusBadge status="Safe" />);
    expect(screen.getByText('Safe')).toBeInTheDocument();

    rerender(<StatusBadge status="Over-Exploited" />);
    expect(screen.getByText('Over-Exploited')).toBeInTheDocument();
  });

  it('renders ProvenanceBadge with scientific labels', () => {
    render(<ProvenanceBadge provenance="OBSERVED" />);
    expect(screen.getByText('OBSERVED')).toBeInTheDocument();
  });

  it('renders MetricCard with values, units, and reporting period', () => {
    render(
      <MetricCard
        label="Export Blue Water"
        value={150000}
        unit="m³"
        period="2020-21"
        provenance="INFERRED"
      />
    );
    expect(screen.getByText('Export Blue Water')).toBeInTheDocument();
    expect(screen.getByText('m³')).toBeInTheDocument();
    expect(screen.getByText(/Period: 2020-21/)).toBeInTheDocument();
    expect(screen.getByText('INFERRED')).toBeInTheDocument();
  });

  it('renders honest placeholder in MetricCard when data is unavailable', () => {
    render(
      <MetricCard
        label="Groundwater Extraction"
        value={null}
        isUnavailable={true}
        unavailableReason="Unavailable — source data not loaded"
      />
    );
    expect(screen.getByText('Unavailable — source data not loaded')).toBeInTheDocument();
  });

  it('renders EmptyState with missing dataset explanation and route link', () => {
    render(
      <BrowserRouter>
        <EmptyState
          isMissingDataset={true}
          missingDatasetName="Agricultural Exports"
          actionHref="/methodology"
          actionText="Inspect Methodology"
        />
      </BrowserRouter>
    );
    expect(screen.getByText(/Agricultural Exports has not been loaded/)).toBeInTheDocument();
    expect(screen.getByText('Inspect Methodology')).toBeInTheDocument();
  });

  it('renders LoadingState with accessible message', () => {
    render(<LoadingState message="Connecting to analytics engine..." />);
    expect(screen.getByText('Connecting to analytics engine...')).toBeInTheDocument();
  });
});
