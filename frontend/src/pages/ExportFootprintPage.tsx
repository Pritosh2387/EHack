import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDataStatus } from '../api/dataStatus';
import { fetchExportsLedger, fetchExportFilters, type ExportLedgerFilterParams } from '../api/exports';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { FilterPanel } from '../components/forms/FilterPanel';
import { MetricCard } from '../components/feedback/MetricCard';
import { DataTable, type Column } from '../components/tables/DataTable';
import { SourcePanel } from '../components/feedback/SourcePanel';
import { ProvenanceBadge } from '../components/feedback/ProvenanceBadge';
import { EmptyState } from '../components/feedback/EmptyState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { ChartCard } from '../components/charts/ChartCard';
import { formatNumber, formatCropName } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Ship, Droplets, Info } from 'lucide-react';
import type { ExportFootprintResult } from '../types/api';

export const ExportFootprintPage: React.FC = () => {
  // 1. Fetch authoritative filter metadata from backend
  const { data: filtersData, isLoading: isFiltersLoading } = useQuery({
    queryKey: ['exports-filters'],
    queryFn: fetchExportFilters,
  });

  const { data: dataStatus } = useQuery({
    queryKey: ['data-status'],
    queryFn: fetchDataStatus,
  });

  // 2. Derive available financial years from backend metadata (defaults to latest year: 2024-25)
  const availableYears: string[] = useMemo(() => {
    if (filtersData?.financial_years && filtersData.financial_years.length > 0) {
      return filtersData.financial_years;
    }
    const statusYears = dataStatus?.join_coverage?.export_years;
    if (Array.isArray(statusYears) && statusYears.length > 0) {
      return statusYears;
    }
    return ['2024-25'];
  }, [filtersData, dataStatus]);

  // 3. Derive compatible commodities (having both export trade records & footprint coefficients)
  const availableCrops: string[] = useMemo(() => {
    if (filtersData?.commodities && filtersData.commodities.length > 0) {
      return filtersData.commodities;
    }
    const exportComms = dataStatus?.join_coverage?.export_commodities || [];
    const hasRice = exportComms.some((c: string) => c.toLowerCase().includes('rice'));
    const hasWheat = exportComms.some((c: string) => c.toLowerCase().includes('wheat'));
    const crops: string[] = [];
    if (hasRice) crops.push('rice');
    if (hasWheat) crops.push('wheat');
    return crops.length > 0 ? crops : ['rice', 'wheat'];
  }, [filtersData, dataStatus]);

  // Initial filter state defaults to valid loaded dataset (FY 2024-25, Rice, All components)
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [financialYear, setFinancialYear] = useState<string>('2024-25');
  const [waterComponent, setWaterComponent] = useState<string>('all');

  // Query state
  const [activeParams, setActiveParams] = useState<ExportLedgerFilterParams>({
    crop: 'rice',
    financial_year: '2024-25',
    water_component: 'all',
  });

  // Synchronize state if backend supplies a specific default year
  useEffect(() => {
    if (filtersData?.default_financial_year && financialYear === '2024-25') {
      if (financialYear !== filtersData.default_financial_year) {
        setFinancialYear(filtersData.default_financial_year);
        setActiveParams((prev) => ({ ...prev, financial_year: filtersData.default_financial_year }));
      }
    }
  }, [filtersData]);

  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['exports-ledger', activeParams],
    queryFn: () => fetchExportsLedger(activeParams),
    enabled: Boolean(activeParams.crop),
    retry: false,
  });

  const handleApply = () => {
    setActiveParams({
      crop: selectedCrop,
      financial_year: financialYear || undefined,
      water_component: waterComponent,
    });
  };

  const handleReset = () => {
    const resetCrop = availableCrops[0] || 'rice';
    const resetYear = availableYears[0] || '2024-25';
    setSelectedCrop(resetCrop);
    setFinancialYear(resetYear);
    setWaterComponent('all');
    setActiveParams({
      crop: resetCrop,
      financial_year: resetYear,
      water_component: 'all',
    });
  };

  const results = ledgerData?.results || [];
  const firstResult = results[0];

  // Aggregated totals across all returned categories for the commodity
  const totalQuantity = results.reduce((sum, r) => sum + (r.export_quantity || 0), 0);
  const totalGreen = results.reduce((sum, r) => sum + (r.estimated_green_water || 0), 0);
  const totalBlue = results.reduce((sum, r) => sum + (r.estimated_blue_water || 0), 0);
  const totalGrey = results.reduce((sum, r) => sum + (r.estimated_grey_water || 0), 0);

  // Chart preparation with distinct labels for product categories (e.g. Basmati Rice vs Non-Basmati Rice)
  const chartData = results.map((r) => ({
    label: results.length > 1 ? `${formatCropName(r.crop)} (${r.financial_year})` : r.financial_year,
    crop: formatCropName(r.crop),
    period: r.financial_year,
    green: r.estimated_green_water ?? 0,
    blue: r.estimated_blue_water ?? 0,
    grey: r.estimated_grey_water ?? 0,
  }));

  const columns: Column<ExportFootprintResult>[] = [
    {
      key: 'crop',
      header: 'Commodity Category',
      render: (r) => <span className="font-semibold">{formatCropName(r.crop)}</span>,
    },
    {
      key: 'financial_year',
      header: 'Financial Year',
    },
    {
      key: 'export_quantity',
      header: 'Export Quantity',
      align: 'right',
      render: (r) => (
        <span>
          {formatNumber(r.export_quantity)} <span className="text-[#66736A]">{r.export_quantity_unit}</span>
        </span>
      ),
    },
    {
      key: 'export_value',
      header: 'Export Value',
      align: 'right',
      render: (r) => (
        r.export_value != null ? (
          <span>
            {formatNumber(r.export_value)} <span className="text-[#66736A]">{r.export_value_currency || 'USD \'000'}</span>
          </span>
        ) : (
          <span className="text-[#66736A]">—</span>
        )
      ),
    },
    {
      key: 'estimated_green_water',
      header: 'Green Water (m³)',
      align: 'right',
      render: (r) => (
        r.estimated_green_water != null ? (
          <span className="color-green-water font-medium">{formatNumber(r.estimated_green_water)}</span>
        ) : (
          <span className="text-[#66736A]">—</span>
        )
      ),
    },
    {
      key: 'estimated_blue_water',
      header: 'Blue Water (m³)',
      align: 'right',
      render: (r) => (
        r.estimated_blue_water != null ? (
          <span className="color-blue-water font-medium">{formatNumber(r.estimated_blue_water)}</span>
        ) : (
          <span className="text-[#66736A]">—</span>
        )
      ),
    },
    {
      key: 'estimated_grey_water',
      header: 'Grey Water (m³)',
      align: 'right',
      render: (r) => (
        r.estimated_grey_water != null ? (
          <span className="color-grey-water font-medium">{formatNumber(r.estimated_grey_water)}</span>
        ) : (
          <span className="text-[#66736A]">—</span>
        )
      ),
    },
    {
      key: 'coefficient_unit',
      header: 'Coefficient Unit',
      render: (r) => <span className="text-[#66736A] font-mono text-[11px]">{r.coefficient_unit}</span>,
    },
    {
      key: 'provenance',
      header: 'Provenance',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(r.provenance || {}).map(([dim, val]) => (
            <ProvenanceBadge key={dim} provenance={val} label={dim.slice(0, 6)} />
          ))}
        </div>
      ),
    },
  ];

  const isLoading = isLedgerLoading || (isFiltersLoading && !filtersData);

  return (
    <AppShell pageTitle="Export Water Footprint">
      <PageHeader
        title="Export Water Footprint Analysis"
        subtitle="National agricultural export trade analysis and estimated embedded green, blue, and grey water footprint volumes."
      />

      {/* Scope Disclaimer */}
      <div className="mb-6 p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <span>
          <strong>National Level Analytics Scope:</strong> This view reflects national trade statistics from the Ministry of Commerce / APEDA. It does not imply that national exports are traced to a specific state or district aquifer, as agricultural trade commodities are sourced and blended nationally.
        </span>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        title="Export Ledger Filters"
        onApply={handleApply}
        onReset={handleReset}
        isLoading={isLoading}
        className="mb-6"
      >
        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">
            Supported Commodity
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B] focus:ring-1 focus:ring-[#14532D]"
          >
            {availableCrops.map((c) => (
              <option key={c} value={c}>
                {c === 'rice' ? 'Rice (Basmati & Non-Basmati)' : formatCropName(c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">
            Financial Year
          </label>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B] focus:ring-1 focus:ring-[#14532D]"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                FY {year}
              </option>
            ))}
            <option value="">All Available Years</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">
            Water Component
          </label>
          <select
            value={waterComponent}
            onChange={(e) => setWaterComponent(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B] focus:ring-1 focus:ring-[#14532D]"
          >
            <option value="all">All Components (Green, Blue, Grey)</option>
            <option value="green">Green Water Only (Rainfall)</option>
            <option value="blue">Blue Water Only (Irrigation)</option>
            <option value="grey">Grey Water Only (Assimilation)</option>
          </select>
        </div>
      </FilterPanel>

      {/* Main Content Area: Distinct States */}
      {!activeParams.crop ? (
        <EmptyState
          title="Select a Commodity"
          description="Please select a supported agricultural commodity from the filters above to view export water footprint analytics."
        />
      ) : isLoading ? (
        <LoadingState message="Fetching export water footprint calculations from backend..." />
      ) : isError ? (
        <div className="space-y-6">
          {(error as any)?.message?.toLowerCase().includes('dataset is unavailable') ? (
            <EmptyState
              isMissingDataset
              missingDatasetName="Agricultural Exports or Crop Water Footprint Dataset"
              description={
                (error as any)?.message ||
                'Real agricultural exports dataset or crop water footprint dataset is unavailable or failed validation.'
              }
              actionHref="/methodology"
              actionText="View Dataset Checklist"
            />
          ) : null}
          <ErrorState
            title="Export Analytics Service Notice"
            message={(error as any)?.message || 'Unable to load export ledger data.'}
            onRetry={() => refetch()}
          />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No Export Records Returned"
          description={
            ledgerData?.message ||
            `The analytics service returned zero export entries for ${formatCropName(activeParams.crop)}${
              activeParams.financial_year ? ` in financial year ${activeParams.financial_year}` : ''
            }. Available dataset records are for FY ${availableYears.join(', ')}.`
          }
          actionText={availableYears[0] ? `Switch to FY ${availableYears[0]}` : undefined}
          onAction={
            availableYears[0]
              ? () => {
                  setFinancialYear(availableYears[0]);
                  setActiveParams((prev) => ({ ...prev, financial_year: availableYears[0] }));
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label={results.length > 1 ? `Export Quantity (${results.length} categories)` : 'Observed Export Quantity'}
              value={totalQuantity}
              unit="tonnes"
              period={activeParams.financial_year ? `FY ${activeParams.financial_year}` : firstResult?.financial_year}
              provenance="OBSERVED"
              tooltip={
                results.length > 1
                  ? `Combined export quantity across ${results.length} product categories: ${results
                      .map((r) => `${formatCropName(r.crop)} (${formatNumber(r.export_quantity)} t)`)
                      .join('; ')}.`
                  : 'Directly reported agricultural export quantity from TradeStat / APEDA.'
              }
              icon={<Ship className="w-4 h-4" />}
            />

            <MetricCard
              label="Estimated Blue Water"
              value={waterComponent === 'all' || waterComponent === 'blue' ? totalBlue : null}
              unit="m³"
              period={activeParams.financial_year ? `FY ${activeParams.financial_year}` : firstResult?.financial_year}
              provenance="INFERRED"
              isUnavailable={waterComponent !== 'all' && waterComponent !== 'blue'}
              unavailableReason="Excluded by water component filter"
              tooltip="Calculated volume of surface/groundwater used for irrigation embedded in export."
              icon={<Droplets className="w-4 h-4 text-sky-600" />}
            />

            <MetricCard
              label="Estimated Green Water"
              value={waterComponent === 'all' || waterComponent === 'green' ? totalGreen : null}
              unit="m³"
              period={activeParams.financial_year ? `FY ${activeParams.financial_year}` : firstResult?.financial_year}
              provenance="INFERRED"
              isUnavailable={waterComponent !== 'all' && waterComponent !== 'green'}
              unavailableReason="Excluded by water component filter"
              tooltip="Calculated volume of rainwater consumed in crop evapotranspiration."
              icon={<Droplets className="w-4 h-4 text-emerald-600" />}
            />

            <MetricCard
              label="Estimated Grey Water"
              value={waterComponent === 'all' || waterComponent === 'grey' ? totalGrey : null}
              unit="m³"
              period={activeParams.financial_year ? `FY ${activeParams.financial_year}` : firstResult?.financial_year}
              provenance="INFERRED"
              isUnavailable={waterComponent !== 'all' && waterComponent !== 'grey'}
              unavailableReason="Excluded by water component filter"
              tooltip="Theoretical dilution volume required to assimilate pollution to ambient water quality standards; not physical water consumed or abstracted."
              icon={<Droplets className="w-4 h-4 text-slate-500" />}
            />
          </div>

          {/* Chart Visualization */}
          <ChartCard
            title={`Water Footprint Component Breakdown: ${formatCropName(activeParams.crop)}`}
            subtitle="Comparing green, blue, and grey water components without combining into misleading aggregated totals"
            unit="m³"
            source="Mekonnen & Hoekstra (2011) / TradeStat / APEDA"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v) => formatNumber(v, { compact: true })} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${formatNumber(Number(val))} m³`, name]}
                  />
                  <Legend />
                  {(waterComponent === 'all' || waterComponent === 'green') && (
                    <Bar dataKey="green" name="Green Water (Rainfall)" fill="#15803d" radius={[4, 4, 0, 0]} />
                  )}
                  {(waterComponent === 'all' || waterComponent === 'blue') && (
                    <Bar dataKey="blue" name="Blue Water (Irrigation/Groundwater)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  )}
                  {(waterComponent === 'all' || waterComponent === 'grey') && (
                    <Bar dataKey="grey" name="Grey Water (Pollution Assimilation)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-[#66736A] leading-relaxed">
              <p>
                <strong>Scientific Interpretation Note:</strong> These values estimate water-footprint components associated with exported quantities using published global estimates (Mekonnen & Hoekstra 2011). Grey water represents theoretical dilution volume for ambient water quality standards, not physical water consumed or abstracted. They are not direct measurements of current water withdrawals or aquifer depletion in specific Indian states or districts.
              </p>
            </div>
          </ChartCard>

          {/* Results Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A]">
              Detailed Export Ledger Results
            </h3>
            <DataTable
              data={results}
              columns={columns}
              keyExtractor={(r, idx) => `${r.crop}-${r.financial_year}-${idx}`}
            />
          </div>

          {/* Source Details & Provenance */}
          {firstResult && (
            <SourcePanel
              methodology={firstResult.calculation_methodology}
              dataSources={firstResult.data_sources}
              provenance={firstResult.provenance}
              limitations={firstResult.limitations}
            />
          )}
        </div>
      )}
    </AppShell>
  );
};
