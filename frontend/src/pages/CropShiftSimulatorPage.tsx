import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMetadata } from '../api/metadata';
import { simulateCropShift } from '../api/scenarios';
import { createDecisionReceipt } from '../api/receipts';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { ScenarioComparison } from '../components/feedback/ScenarioComparison';
import { DecisionReceiptView } from '../components/feedback/DecisionReceiptView';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { formatCropName, formatNumber } from '../utils/formatters';
import type { CropShiftResult, ReceiptResponse } from '../types/api';
import {
  ArrowRightLeft,
  Play,
  History,
  AlertCircle,
} from 'lucide-react';

export const CropShiftSimulatorPage: React.FC = () => {
  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });

  const regions = metadata?.supported_regions || ['Punjab', 'Haryana', 'Maharashtra', 'Uttar Pradesh'];
  const crops = metadata?.supported_crops || ['rice', 'wheat', 'sugarcane', 'cotton', 'maize', 'soybean'];

  // Form input state
  const [region, setRegion] = useState<string>('Punjab');
  const [baselineCrop, setBaselineCrop] = useState<string>('rice');
  const [alternativeCrop, setAlternativeCrop] = useState<string>('wheat');
  const [areaHectares, setAreaHectares] = useState<string>('1000');
  const [referenceYear, setReferenceYear] = useState<string>('2020-21');
  const [includeSuitability, setIncludeSuitability] = useState<boolean>(true);

  // Form validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Results & session history state
  const [activeResult, setActiveResult] = useState<CropShiftResult | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptResponse | null>(null);
  const [history, setHistory] = useState<CropShiftResult[]>([]);

  // Simulation Mutation
  const simulationMutation = useMutation({
    mutationFn: simulateCropShift,
    onSuccess: (data) => {
      setActiveResult(data.result);
      setActiveReceipt(null);
      // Append to session history (in-memory only)
      setHistory((prev) => [data.result, ...prev.slice(0, 9)]);
    },
  });

  // Receipt Generation Mutation
  const receiptMutation = useMutation({
    mutationFn: createDecisionReceipt,
    onSuccess: (receiptData) => {
      setActiveReceipt(receiptData);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    const areaNum = parseFloat(areaHectares);
    if (isNaN(areaNum) || areaNum <= 0) {
      setValidationError('Cultivated area must be a strictly positive number greater than 0.');
      return;
    }

    if (baselineCrop.toLowerCase() === alternativeCrop.toLowerCase()) {
      setValidationError('Baseline crop and alternative crop cannot be identical.');
      return;
    }

    if (!region) {
      setValidationError('A supported region must be selected.');
      return;
    }

    simulationMutation.mutate({
      region,
      baseline_crop: baselineCrop,
      alternative_crop: alternativeCrop,
      area_hectares: areaNum,
      reference_year: referenceYear,
      include_suitability: includeSuitability,
    });
  };

  const handleGenerateReceipt = () => {
    if (!activeResult) return;

    receiptMutation.mutate({
      analysis_type: 'crop_shift_scenario',
      parameters: {
        region: activeResult.region,
        baseline_crop: activeResult.baseline_crop,
        alternative_crop: activeResult.alternative_crop,
        area_hectares: activeResult.area_hectares,
        reference_year: activeResult.reference_year,
      },
      result_data: {
        baseline_demand: activeResult.baseline_demand,
        alternative_demand: activeResult.alternative_demand,
        absolute_difference: activeResult.absolute_difference,
        percentage_difference: activeResult.percentage_difference,
        difference_unit: activeResult.difference_unit,
      },
    });
  };

  return (
    <AppShell pageTitle="Crop-Shift Simulator">
      <PageHeader
        title="Crop-Shift Scenario Simulator"
        subtitle="Compare estimated production-side blue-water irrigation demand under a baseline crop and an alternative crop under explicit assumptions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & History */}
        <div className="space-y-6">
          {/* Simulator Form */}
          <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <ArrowRightLeft className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-[#17211B]">Scenario Formulation</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">
                  Target Region / State
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17211B] mb-1">
                    Baseline Crop
                  </label>
                  <select
                    value={baselineCrop}
                    onChange={(e) => setBaselineCrop(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                  >
                    {crops.map((c) => (
                      <option key={c} value={c}>
                        {formatCropName(c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#17211B] mb-1">
                    Alternative Crop
                  </label>
                  <select
                    value={alternativeCrop}
                    onChange={(e) => setAlternativeCrop(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                  >
                    {crops.map((c) => (
                      <option key={c} value={c}>
                        {formatCropName(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">
                  Cultivated Area (Hectares)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(e.target.value)}
                  placeholder="e.g. 1000"
                  required
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">
                  Reference Period
                </label>
                <select
                  value={referenceYear}
                  onChange={(e) => setReferenceYear(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  <option value="2020-21">2020-21</option>
                  <option value="2019-20">2019-20</option>
                  <option value="2018-19">2018-19</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="suitability"
                  checked={includeSuitability}
                  onChange={(e) => setIncludeSuitability(e.target.checked)}
                  className="rounded text-[#14532D] focus:ring-[#14532D]"
                />
                <label htmlFor="suitability" className="text-[11px] text-[#66736A]">
                  Include agronomic suitability constraints in response
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={simulationMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#14532D] hover:bg-[#0F3D21] text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{simulationMutation.isPending ? 'Simulating Model...' : 'Run Scenario'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Session History Panel */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs text-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-[#17211B]">
                  <History className="w-4 h-4 text-[#0F766E]" />
                  <span>Session History ({history.length})</span>
                </div>
                <span className="text-[10px] text-slate-500">Not persisted across reloads</span>
              </div>

              <div className="space-y-2">
                {history.map((h, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveResult(h);
                      setActiveReceipt(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      activeResult === h
                        ? 'border-[#0F766E] bg-teal-50/50'
                        : 'border-slate-100 hover:border-slate-200 bg-stone-50/30'
                    }`}
                  >
                    <div className="font-semibold text-[#17211B] flex justify-between">
                      <span>{formatCropName(h.baseline_crop)} → {formatCropName(h.alternative_crop)}</span>
                      <span className="text-[#0F766E]">{formatNumber(h.area_hectares)} ha</span>
                    </div>
                    <div className="text-[11px] text-[#66736A] mt-0.5 flex justify-between">
                      <span>{h.region}</span>
                      <span>Δ {formatNumber(h.absolute_difference)} m³</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results & Comparisons */}
        <div className="lg:col-span-2 space-y-6">
          {simulationMutation.isPending ? (
            <LoadingState message="Executing crop-shift simulation on backend..." />
          ) : simulationMutation.isError ? (
            <ErrorState
              title="Simulation Could Not Complete"
              message={
                (simulationMutation.error as any)?.message ||
                'The backend analytics service could not calculate this scenario. Verify dataset presence.'
              }
            />
          ) : activeResult ? (
            <>
              <ScenarioComparison
                result={activeResult}
                onGenerateReceipt={handleGenerateReceipt}
                isGeneratingReceipt={receiptMutation.isPending}
              />

              {activeReceipt && (
                <div className="mt-6">
                  <DecisionReceiptView receipt={activeReceipt} />
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center rounded-xl bg-white border border-[#E1E8E1]">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto mb-3">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17211B]">Ready to Run Scenario</h3>
              <p className="text-xs text-[#66736A] mt-1 max-w-md mx-auto leading-relaxed">
                Configure your target region, baseline crop, alternative crop, and cultivated land area in the scenario form to compare blue-water demand projections.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
