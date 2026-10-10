import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '../app/routes';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Application Routes & Navigation (Section 4 & 21)', () => {
  it('renders Dashboard page on root path /', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: 'Water Shadow' })).toBeInTheDocument();
  });

  it('renders Export Water Footprint page on /exports', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/exports']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Export Water Footprint Analysis')).toBeInTheDocument();
  });

  it('renders Regional Explorer on /regions', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/regions']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Regional Water & Agriculture Explorer')).toBeInTheDocument();
  });

  it('renders Crop-Shift Simulator on /crop-shift', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/crop-shift']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Crop-Shift Scenario Simulator')).toBeInTheDocument();
  });

  it('renders Resource Optimization on /optimization', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/optimization']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Crop Allocation Resource Optimization')).toBeInTheDocument();
  });

  it('renders Sensitivity Analysis on /sensitivity', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/sensitivity']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Parameter Sensitivity Analysis')).toBeInTheDocument();
  });

  it('renders Explain Analysis on /explain', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/explain']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Scientific Explainability Engine')).toBeInTheDocument();
  });

  it('renders Decision Receipts on /receipts', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/receipts']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Traceable Decision Receipts')).toBeInTheDocument();
  });

  it('renders Data & Methodology on /methodology', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/methodology']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Scientific Data Provenance & Methodology')).toBeInTheDocument();
  });
});
