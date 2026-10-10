import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMetadata } from '../api/metadata';
import { optimizeCropAllocation } from '../api/optimization';
import { createDecisionReceipt } from '../api/receipts';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { OptimizationResultPanel } from '../components/feedback/OptimizationResultPanel';
import { DecisionReceiptView } from '../components/feedback/DecisionReceiptView';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import type { OptimizationResult, ReceiptResponse } from '../types/api';
import { Sliders, Play } from 'lucide-react';

export const ResourceOptimizationPage: React.FC = () => {
  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });

  const regions = metadata?.supported_regions || ['Punjab', 'Haryana', 'Maharashtra', 'Uttar Pradesh'];

  // Form states
  const [region, setRegion] = useState<string>('Punjab');
  const [objective, setObjective] = useState<string>('minimize_blue_water');
  const [timePeriod, setTimePeriod] = useState<string>('2020-21');
  const [minProductionFactor, setMinProductionFactor] = useState<string>('0.8');

  const [activeResult, setActiveResult] = useState<OptimizationResult | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptResponse | null>(null);

  // Mutation for solver execution
  const optimizationMutation = useMutation({
    mutationFn: optimizeCropAllocation,
    onSuccess: (data) => {
      setActiveResult(data.result);
      setActiveReceipt(null);
    },
  });

  // Mutation for decision receipt creation
  const receiptMutation = useMutation({
    mutationFn: createDecisionReceipt,
    onSuccess: (receiptData) => {
      setActiveReceipt(receiptData);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minFactorNum = parseFloat(minProductionFactor);

    optimizationMutation.mutate({
      region,
      objective,
      time_period: timePeriod,
      constraints: {
        min_production_factor: !isNaN(minFactorNum) ? minFactorNum : 0.8,
      },
    });
  };

  const handleGenerateReceipt = () => {
    if (!activeResult) return;

    receiptMutation.mutate({
      analysis_type: 'resource_optimization',
      parameters: {
        region: activeResult.region,
        objective: activeResult.objective,
        time_period: activeResult.time_period,
        min_production_factor: parseFloat(minProductionFactor),
      },
      result_data: {
        baseline_allocation: activeResult.baseline_allocation,
        optimized_allocation: activeResult.optimized_allocation,
        baseline_blue_water_demand: activeResult.baseline_blue_water_demand,
        optimized_blue_water_demand: activeResult.optimized_blue_water_demand,
        water_demand_difference: activeResult.water_demand_difference,
        water_demand_difference_percent: activeResult.water_demand_difference_percent,
        solver_status: activeResult.solver_status,
        feasibility_status: activeResult.feasibility_status,
      },
    });
  };

  return (
    <AppShell pageTitle="Resource Optimization">
      <PageHeader
        title="Crop Allocation Resource Optimization"
        subtitle="Solve linear programming models to determine land-allocation alternatives that minimize agricultural blue-water consumption under production constraints."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <div>
          <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs sticky top-24">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-[#14532D]" />
              <h3 className="text-sm font-bold text-[#17211B]">Optimization Parameters</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Target Region</label>
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

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Optimization Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  <option value="minimize_blue_water">minimize_blue_water (Linear Programming)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Supported by the SciPy HiGHS linear programming backend
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Time Period</label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  <option value="2020-21">2020-21</option>
                  <option value="2019-20">2019-20</option>
                  <option value="2018-19">2018-19</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">
                  Minimum Production Factor (Constraint)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={minProductionFactor}
                  onChange={(e) => setMinProductionFactor(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Enforces that total crop production is at least {(parseFloat(minProductionFactor || '0.8') * 100).toFixed(0)}% of baseline
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={optimizationMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#14532D] hover:bg-[#0F3D21] text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{optimizationMutation.isPending ? 'Solving LP Model...' : 'Run Optimization'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Output Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {optimizationMutation.isPending ? (
            <LoadingState message="Executing Scipy HiGHS solver on backend service..." />
          ) : optimizationMutation.isError ? (
            <ErrorState
              title="Optimization Solver Execution Failed"
              message={
                (optimizationMutation.error as any)?.message ||
                'The optimization engine could not solve this problem. Verify dataset availability.'
              }
            />
          ) : activeResult ? (
            <>
              <OptimizationResultPanel
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
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532D] flex items-center justify-center mx-auto mb-3">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17211B]">Optimization Model Ready</h3>
              <p className="text-xs text-[#66736A] mt-1 max-w-md mx-auto leading-relaxed">
                Specify your regional boundary, baseline agricultural year, and production constraints to solve for optimal land allocation and water reduction.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
