import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from '../api/metadata';
import { fetchExportsLedger, type ExportLedgerFilterParams } from '../api/exports';
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
  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });

  const crops = metadata?.supported_crops || ['rice', 'wheat', 'sugarcane', 'cotton', 'soybean'];

  // Filter state
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [financialYear, setFinancialYear] = useState<string>('2020-21');
  const [waterComponent, setWaterComponent] = useState<string>('all');

  // Query state
  const [activeParams, setActiveParams] = useState<ExportLedgerFilterParams>({
    crop: 'rice',
    financial_year: '2020-21',
    water_component: 'all',
  });

  const {
    data: ledgerData,
    isLoading,
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
    setSelectedCrop('rice');
    setFinancialYear('2020-21');
    setWaterComponent('all');
    setActiveParams({
      crop: 'rice',
      financial_year: '2020-21',
      water_component: 'all',
    });
  };

  const results = ledgerData?.results || [];
  const firstResult = results[0];

  // Chart preparation
  const chartData = results.map((r) => ({
    period: r.financial_year,
    crop: formatCropName(r.crop),
    green: r.estimated_green_water ?? 0,
    blue: r.estimated_blue_water ?? 0,
    grey: r.estimated_grey_water ?? 0,
  }));

  const columns: Column<ExportFootprintResult>[] = [
    {
      key: 'crop',
      header: 'Commodity',
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
      key: 'estimated_green_water',
      header: 'Green Water (m³)',
      align: 'right',
      render: (r) => (
        <span className="color-green-water font-medium">{formatNumber(r.estimated_green_water)}</span>
      ),
    },
    {
      key: 'estimated_blue_water',
      header: 'Blue Water (m³)',
      align: 'right',
      render: (r) => (
        <span className="color-blue-water font-medium">{formatNumber(r.estimated_blue_water)}</span>
      ),
    },
    {
      key: 'estimated_grey_water',
      header: 'Grey Water (m³)',
      align: 'right',
      render: (r) => (
        <span className="color-grey-water font-medium">{formatNumber(r.estimated_grey_water)}</span>
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
          <strong>National Level Analytics Scope:</strong> This view reflects national trade statistics from the Ministry of Commerce. It does not imply that national exports are traced to a specific state or district aquifer, as agricultural trade commodities are sourced and blended nationally.
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
            {crops.map((c) => (
              <option key={c} value={c}>
                {formatCropName(c)}
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
            <option value="2020-21">2020-21</option>
            <option value="2019-20">2019-20</option>
            <option value="2018-19">2018-19</option>
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

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Fetching export water footprint calculations from backend..." />
      ) : isError ? (
        <div className="space-y-6">
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
          <ErrorState
            title="Export Analytics Service Notice"
            message={(error as any)?.message || 'Unable to load export ledger data.'}
            onRetry={() => refetch()}
          />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No Export Records Returned"
          description="The analytics service returned zero export entries for the specified commodity and financial year."
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Observed Export Quantity"
              value={firstResult?.export_quantity}
              unit={firstResult?.export_quantity_unit}
              period={firstResult?.financial_year}
              provenance="OBSERVED"
              tooltip="Directly reported agricultural export quantity from TradeStat."
              icon={<Ship className="w-4 h-4" />}
            />

            <MetricCard
              label="Estimated Blue Water"
              value={firstResult?.estimated_blue_water}
              unit="m³"
              period={firstResult?.financial_year}
              provenance="INFERRED"
              tooltip="Calculated volume of surface/groundwater used for irrigation embedded in export."
              icon={<Droplets className="w-4 h-4 text-sky-600" />}
            />

            <MetricCard
              label="Estimated Green Water"
              value={firstResult?.estimated_green_water}
              unit="m³"
              period={firstResult?.financial_year}
              provenance="INFERRED"
              tooltip="Calculated volume of rainwater consumed in crop evapotranspiration."
              icon={<Droplets className="w-4 h-4 text-emerald-600" />}
            />

            <MetricCard
              label="Estimated Grey Water"
              value={firstResult?.estimated_grey_water}
              unit="m³"
              period={firstResult?.financial_year}
              provenance="INFERRED"
              tooltip="Volume required to dilute agrochemical pollution to water quality thresholds."
              icon={<Droplets className="w-4 h-4 text-slate-500" />}
            />
          </div>

          {/* Section 6.5 Chart Visualization */}
          <ChartCard
            title={`Water Footprint Component Breakdown: ${formatCropName(firstResult?.crop)}`}
            subtitle="Comparing green, blue, and grey water components without combining into misleading aggregated totals"
            unit="m³"
            source="Mekonnen & Hoekstra (2011) / TradeStat"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
                  <XAxis dataKey="period" />
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
                <strong>Scientific Interpretation Note:</strong> These values estimate water-footprint components associated with exported quantities using the selected coefficients and methodology. They are not direct measurements of current water withdrawals for those exports.
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

          {/* Section 6.7 Source Details */}
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
