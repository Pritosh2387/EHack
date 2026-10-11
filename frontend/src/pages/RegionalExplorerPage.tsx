import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCropProduction,
  fetchGroundwaterStress,
  fetchRegionalFilters,
} from '../api/regions';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { FilterPanel } from '../components/forms/FilterPanel';
import { MetricCard } from '../components/feedback/MetricCard';
import { DataTable, type Column } from '../components/tables/DataTable';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { EmptyState } from '../components/feedback/EmptyState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { RegionalMap } from '../components/maps/RegionalMap';
import { ChartCard } from '../components/charts/ChartCard';
import { formatNumber, formatCropName } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Info, Layers, Sprout } from 'lucide-react';
import type {
  GroundwaterAssessmentUnit,
  CropProductionResult,
} from '../types/api';

export const RegionalExplorerPage: React.FC = () => {
  const { data: filtersData } = useQuery({
    queryKey: ['regional-filters'],
    queryFn: fetchRegionalFilters,
    staleTime: 5 * 60 * 1000,
  });

  const states = filtersData?.production_states?.length
    ? filtersData.production_states
    : ['Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 'Haryana', 'Rajasthan', 'Bihar', 'West Bengal', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Chhattisgarh', 'Odisha', 'Gujarat', 'Maharashtra', 'Uttarakhand', 'Himachal Pradesh'];
  const gwStates = filtersData?.groundwater_states || ['Punjab'];
  const cropYears = filtersData?.crop_years?.length ? filtersData.crop_years : ['2024-25', '2023-24'];
  const groundwaterYears = filtersData?.groundwater_years?.length ? filtersData.groundwater_years : ['2022'];

  // Independent Filter state
  const [selectedState, setSelectedState] = useState<string>('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [cropYear, setCropYear] = useState<string>('2023-24');
  const [groundwaterYear, setGroundwaterYear] = useState<string>('2022');

  const availableCropsForState = (filtersData?.crops_by_state && filtersData.crops_by_state[selectedState])
    ? filtersData.crops_by_state[selectedState]
    : (filtersData?.crops || ['rice', 'wheat']);

  // Applied query state
  const [activeState, setActiveState] = useState<string>('Punjab');
  const [activeDistrict, setActiveDistrict] = useState<string>('');
  const [activeCrop, setActiveCrop] = useState<string>('rice');
  const [activeCropYear, setActiveCropYear] = useState<string>('2023-24');
  const [activeGroundwaterYear, setActiveGroundwaterYear] = useState<string>('2022');

  // Selected unit details state
  const [selectedUnit, setSelectedUnit] = useState<GroundwaterAssessmentUnit | null>(null);

  // Queries
  const {
    data: cropData,
    isLoading: isCropLoading,
    isError: isCropError,
    error: cropError,
    refetch: refetchCrop,
  } = useQuery({
    queryKey: ['crop-production', activeState, activeDistrict, activeCrop, activeCropYear],
    queryFn: () =>
      fetchCropProduction({
        state: activeState || undefined,
        district: activeDistrict || undefined,
        crop: activeCrop || undefined,
        year: activeCropYear || undefined,
      }),
    retry: false,
  });

  const {
    data: gwData,
    isLoading: isGwLoading,
    isError: isGwError,
    error: gwError,
    refetch: refetchGw,
  } = useQuery({
    queryKey: ['groundwater-stress', activeState, activeDistrict, activeGroundwaterYear],
    queryFn: () =>
      fetchGroundwaterStress({
        state: activeState || undefined,
        district: activeDistrict || undefined,
        year: activeGroundwaterYear || undefined,
      }),
    retry: false,
  });

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const validCrops = filtersData?.crops_by_state?.[newState];
    if (validCrops && validCrops.length > 0 && !validCrops.includes(selectedCrop)) {
      setSelectedCrop(validCrops[0]);
    }
  };

  const handleApply = () => {
    setActiveState(selectedState);
    setActiveDistrict(selectedDistrict);
    setActiveCrop(selectedCrop);
    setActiveCropYear(cropYear);
    setActiveGroundwaterYear(groundwaterYear);
    setSelectedUnit(null);
  };

  const handleReset = () => {
    const defaultSt = filtersData?.default_state || 'Punjab';
    const defaultCr = filtersData?.default_crop || 'rice';
    const defaultCrYr = filtersData?.default_crop_year || '2023-24';
    const defaultGwYr = filtersData?.default_groundwater_year || '2022';

    setSelectedState(defaultSt);
    setSelectedDistrict('');
    setSelectedCrop(defaultCr);
    setCropYear(defaultCrYr);
    setGroundwaterYear(defaultGwYr);
    setActiveState(defaultSt);
    setActiveDistrict('');
    setActiveCrop(defaultCr);
    setActiveCropYear(defaultCrYr);
    setActiveGroundwaterYear(defaultGwYr);
    setSelectedUnit(null);
  };

  const assessmentUnits = gwData?.assessment_units || [];
  const gwSummary = gwData?.summary;
  const cropResults = cropData?.results || [];

  const hasGwForState = gwStates.includes(activeState);
  const gwCount = gwSummary?.total_units ?? 0;
  const isGwUnavailable = !hasGwForState || gwCount === 0;
  const gwUnavailableReason = !hasGwForState
    ? `Groundwater assessment not loaded for ${activeState} (starter dataset covers Ludhiana, Punjab only)`
    : `No CGWB assessment records found for ${activeState} in year ${activeGroundwaterYear}`;

  const isCropUnavailable = cropResults.length === 0;
  const cropUnavailableReason = activeDistrict
    ? `District-level crop production is not available in loaded dataset (official state totals only)`
    : `No crop production records found for ${formatCropName(activeCrop)} in ${activeState} (${activeCropYear})`;

  const totalCropProduction = cropResults.length > 0
    ? cropResults.reduce((sum, r) => sum + (r.production ?? 0), 0)
    : null;

  // Summary chart data: Groundwater categories
  const gwCategoryChartData = gwSummary
    ? [
        { name: 'Safe', count: gwSummary.safe, fill: '#15803d' },
        { name: 'Semi-Critical', count: gwSummary.semi_critical, fill: '#ca8a04' },
        { name: 'Critical', count: gwSummary.critical, fill: '#ea580c' },
        { name: 'Over-Exploited', count: gwSummary.over_exploited, fill: '#dc2626' },
        { name: 'Saline', count: gwSummary.saline, fill: '#9333ea' },
      ]
    : [];

  const gwColumns: Column<GroundwaterAssessmentUnit>[] = [
    {
      key: 'assessment_unit_id',
      header: 'Assessment Unit ID',
      render: (u) => (
        <button
          type="button"
          onClick={() => setSelectedUnit(u)}
          className="text-left font-semibold text-[#0F766E] hover:underline"
        >
          {u.assessment_unit_id}
        </button>
      ),
    },
    { key: 'district', header: 'District' },
    { key: 'state', header: 'State' },
    {
      key: 'category',
      header: 'Official Classification',
      render: (u) => <StatusBadge status={u.category} label={u.category} size="sm" />,
    },
    { key: 'year', header: 'Assessment Year' },
  ];

  const cropColumns: Column<CropProductionResult>[] = [
    { key: 'state', header: 'State' },
    { key: 'district', header: 'District', render: (c) => c.district || 'State Total' },
    { key: 'crop', header: 'Crop', render: (c) => formatCropName(c.crop) },
    { key: 'year', header: 'Year' },
    {
      key: 'area',
      header: 'Cultivated Area',
      align: 'right',
      render: (c) => (
        <span>
          {formatNumber(c.area)} <span className="text-[#66736A]">{c.area_unit}</span>
        </span>
      ),
    },
    {
      key: 'production',
      header: 'Production',
      align: 'right',
      render: (c) => (
        <span>
          {formatNumber(c.production)} <span className="text-[#66736A]">{c.production_unit}</span>
        </span>
      ),
    },
    {
      key: 'yield_',
      header: 'Yield',
      align: 'right',
      render: (c) => (
        <span>
          {formatNumber(c.yield_ ?? c.yield)} <span className="text-[#66736A]">{c.yield_unit}</span>
        </span>
      ),
    },
  ];

  return (
    <AppShell pageTitle="Regional Explorer">
      <PageHeader
        title="Regional Water & Agriculture Explorer"
        subtitle="Examine regional crop production statistics alongside official Central Ground Water Board (CGWB) classifications."
      />

      {/* Section 7.7 Causal Disclaimer */}
      <div className="mb-6 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official Hydrogeological Disclaimer:</strong> Groundwater classifications represent official assessment units and reporting periods supplied by the source (CGWB). Regional crop production and groundwater assessments provide context; spatial association alone does not establish that a specific crop caused a groundwater condition.
        </p>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        title="Regional Explorer Query Filters"
        onApply={handleApply}
        onReset={handleReset}
        isLoading={isCropLoading || isGwLoading}
        className="mb-6"
      >
        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">State</label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B]"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}{gwStates.includes(s) ? ' (CGWB + Production)' : ' (Production only)'}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[#66736A]">
            {gwStates.includes(selectedState)
              ? '✓ State has both CGWB groundwater assessment and crop production records.'
              : 'ℹ️ Selected state has crop production statistics only. CGWB records in starter pack are limited to Punjab.'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">
            District (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Ludhiana"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B]"
          />
          <p className="mt-1 text-[11px] text-[#66736A]">
            Crop production is reported as state-level totals only. District filter applies to CGWB groundwater units (e.g. Ludhiana).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">Crop Commodity</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B]"
          >
            {availableCropsForState.map((c) => (
              <option key={c} value={c}>
                {formatCropName(c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">
            Crop Reporting Year (YYYY-YY)
          </label>
          <select
            value={cropYear}
            onChange={(e) => setCropYear(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B]"
          >
            {cropYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17211B] mb-1.5">
            Groundwater Year (Calendar YYYY)
          </label>
          <select
            value={groundwaterYear}
            onChange={(e) => setGroundwaterYear(e.target.value)}
            className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B]"
          >
            {groundwaterYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </FilterPanel>

      {/* Main Content Layout */}
      {isCropLoading || isGwLoading ? (
        <LoadingState message="Fetching regional crop production & groundwater assessments..." />
      ) : isCropError && isGwError ? (
        <div className="space-y-6">
          <EmptyState
            isMissingDataset
            missingDatasetName="Regional Crop Production & Groundwater Datasets"
            description="Both regional crop production and groundwater datasets are unavailable or failed validation in the analytics service."
            actionHref="/methodology"
            actionText="Check Ingestion Status"
          />
          <ErrorState
            title="Service Request Failed"
            message={(cropError as any)?.message || (gwError as any)?.message || 'Service could not complete query.'}
            onRetry={() => {
              refetchCrop();
              refetchGw();
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Assessed Units"
              value={isGwUnavailable ? null : gwSummary?.total_units}
              unit="units"
              period={activeGroundwaterYear}
              provenance="OBSERVED"
              isUnavailable={isGwUnavailable}
              unavailableReason={gwUnavailableReason}
              tooltip="Total administrative groundwater units recorded for the selected query."
              icon={<Layers className="w-4 h-4" />}
              decimals={0}
            />

            <MetricCard
              label="Safe Units"
              value={isGwUnavailable ? null : gwSummary?.safe}
              unit="units"
              period={activeGroundwaterYear}
              provenance="OBSERVED"
              isUnavailable={isGwUnavailable}
              unavailableReason={gwUnavailableReason}
              tooltip="Assessment units with stage of groundwater extraction ≤ 70%."
              icon={<StatusBadge status="safe" label="" size="sm" />}
              decimals={0}
            />

            <MetricCard
              label="Critical / Over-Exploited"
              value={isGwUnavailable ? null : (gwSummary?.critical || 0) + (gwSummary?.over_exploited || 0)}
              unit="units"
              period={activeGroundwaterYear}
              provenance="OBSERVED"
              isUnavailable={isGwUnavailable}
              unavailableReason={gwUnavailableReason}
              tooltip="Units where groundwater extraction exceeds natural annual recharge or is approaching threshold."
              icon={<StatusBadge status="over-exploited" label="" size="sm" />}
              decimals={0}
            />

            <MetricCard
              label="Crop Production Volume"
              value={isCropUnavailable ? null : totalCropProduction}
              unit={cropResults[0]?.production_unit || 'tonnes'}
              period={activeCropYear}
              provenance="OBSERVED"
              isUnavailable={isCropUnavailable}
              unavailableReason={cropUnavailableReason}
              tooltip="Total reported agricultural yield volume from Ministry of Agriculture."
              icon={<Sprout className="w-4 h-4 text-emerald-700" />}
            />
          </div>

          {/* Map & Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[#17211B] mb-1">
                  Groundwater Assessment Units Spatial Map
                </h3>
                <p className="text-xs text-[#66736A] mb-4">
                  Visualizes categorized assessment units if geographic coordinates are returned by the backend.
                </p>
                <RegionalMap
                  units={assessmentUnits}
                  selectedUnitId={selectedUnit?.assessment_unit_id}
                  onSelectUnit={(u) => setSelectedUnit(u)}
                />
              </div>
            </div>

            {/* Right: Selected Unit Details & Category Summary */}
            <div className="space-y-6">
              {/* Selected Unit Details Panel (Section 7.5) */}
              <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[#17211B] mb-2">
                  Assessment Unit Details
                </h3>

                {selectedUnit ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Unit Identifier
                      </span>
                      <span className="font-mono font-bold text-sm text-[#17211B]">
                        {selectedUnit.assessment_unit_id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block">State:</span>
                        <span className="font-semibold text-slate-900">{selectedUnit.state}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">District:</span>
                        <span className="font-semibold text-slate-900">{selectedUnit.district}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Official Status:</span>
                      <StatusBadge status={selectedUnit.category} label={selectedUnit.category} />
                    </div>

                    <div>
                      <span className="text-slate-500 block">Assessment Year:</span>
                      <span className="font-medium text-slate-800">{selectedUnit.year}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-[#66736A]">
                      <span className="font-semibold block text-slate-700">Source:</span>
                      Central Ground Water Board (CGWB)
                    </div>

                    <div className="p-2.5 bg-blue-50/50 rounded border border-blue-200 text-[11px] text-blue-900">
                      <span className="font-semibold block mb-0.5">Scientific Constraint Notice:</span>
                      State-level crop production is not projected as a unit-level measurement to prevent unsupported geographic causality.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#66736A] p-4 bg-stone-50 rounded-lg border border-stone-200 text-center">
                    Select any assessment unit from the map or table below to inspect its official CGWB records.
                  </p>
                )}
              </div>

              {/* Groundwater Category Chart */}
              {gwSummary && gwSummary.total_units > 0 ? (
                <ChartCard
                  title="Assessment Category Distribution"
                  subtitle="Unit counts by classification"
                  unit="units"
                  source="CGWB Assessment Report"
                >
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gwCategoryChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Assessment Units" fill="#0F766E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              ) : (
                <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-[#17211B] mb-2">
                    Assessment Category Distribution
                  </h3>
                  <p className="text-xs text-[#66736A] p-4 bg-stone-50 rounded-lg border border-stone-200 text-center">
                    {gwUnavailableReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assessment Units Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A]">
              Groundwater Assessment Records ({assessmentUnits.length} units)
            </h3>
            <DataTable
              data={assessmentUnits}
              columns={gwColumns}
              keyExtractor={(u) => u.assessment_unit_id}
              emptyMessage={
                !hasGwForState
                  ? `Groundwater assessment data is not loaded for ${activeState}. The starter dataset currently covers Ludhiana district, Punjab.`
                  : `No groundwater assessment records found for ${activeState} for assessment year ${activeGroundwaterYear}.`
              }
            />
          </div>

          {/* Regional Crop Production Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A]">
              Regional Agricultural Production Statistics ({cropResults.length} records)
            </h3>
            <DataTable
              data={cropResults}
              columns={cropColumns}
              keyExtractor={(c, idx) => `${c.state}-${c.crop}-${c.year}-${idx}`}
              emptyMessage={
                activeDistrict
                  ? `No district-level crop production records found for ${activeDistrict}, ${activeState}. The loaded agricultural statistics dataset contains official state-level totals only. Clear the district filter to view the state total.`
                  : `No crop production records available for ${formatCropName(activeCrop)} in ${activeState} for year ${activeCropYear}.`
              }
            />
          </div>
        </div>
      )}
    </AppShell>
  );
};
