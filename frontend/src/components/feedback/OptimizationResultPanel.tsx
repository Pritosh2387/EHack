import React from 'react';
import type { OptimizationResult } from '../../types/api';
import { formatNumber, formatPercent, formatCropName } from '../../utils/formatters';
import { SourcePanel } from './SourcePanel';
import { StatusBadge } from './StatusBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { FileCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

interface OptimizationResultPanelProps {
  result: OptimizationResult;
  onGenerateReceipt?: () => void;
  isGeneratingReceipt?: boolean;
}

export const OptimizationResultPanel: React.FC<OptimizationResultPanelProps> = ({
  result,
  onGenerateReceipt,
  isGeneratingReceipt = false,
}) => {
  const isInfeasible =
    result.feasibility_status.toLowerCase().includes('infeasible') ||
    result.solver_status.toLowerCase().includes('failed');

  if (isInfeasible) {
    return (
      <div className="bg-red-50/80 rounded-xl border border-red-200 p-6 text-red-900 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-red-900">Optimization Solver Infeasible</h3>
            <p className="text-xs text-red-800 mt-1">
              The optimization model could not find a feasible solution satisfying all constraints simultaneously.
            </p>
            <div className="mt-3 p-3 bg-white/80 rounded border border-red-200 text-xs">
              <p><strong>Solver Status:</strong> {result.solver_status}</p>
              <p><strong>Feasibility:</strong> {result.feasibility_status}</p>
              <p><strong>Solver Algorithm:</strong> {result.solver_used}</p>
            </div>
            <p className="text-xs text-red-700 mt-3">
              Per scientific integrity guidelines, an empty chart with zeroes will not be rendered. Please relax the minimum production requirement or adjust the target region and time period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Build allocation comparison chart data
  const crops = Array.from(
    new Set([
      ...Object.keys(result.baseline_allocation || {}),
      ...Object.keys(result.optimized_allocation || {}),
    ])
  );

  const allocationChartData = crops.map((crop) => ({
    crop: formatCropName(crop),
    baseline: result.baseline_allocation[crop] || 0,
    optimized: result.optimized_allocation[crop] || 0,
  }));

  const waterDemandData = [
    {
      name: 'Baseline Allocation',
      demand: result.baseline_blue_water_demand || 0,
    },
    {
      name: 'Optimized Allocation',
      demand: result.optimized_blue_water_demand || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                Optimization Model Result
              </span>
              <StatusBadge status="feasible" label="Feasible Solution Found" size="sm" />
            </div>
            <h3 className="text-lg font-bold text-[#17211B]">
              Resource Allocation for {result.region} ({result.time_period})
            </h3>
            <p className="text-xs text-[#66736A] mt-0.5">
              Objective: <strong>{result.objective}</strong> | Solver: <strong>{result.solver_used}</strong>
            </p>
          </div>

          {onGenerateReceipt && (
            <button
              type="button"
              onClick={onGenerateReceipt}
              disabled={isGeneratingReceipt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] text-white hover:bg-[#0c5c56] transition-colors disabled:opacity-50 self-start sm:self-auto shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isGeneratingReceipt ? 'Building Receipt...' : 'Generate Traceable Receipt'}</span>
            </button>
          )}
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-stone-50/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Baseline Blue Water Demand
            </span>
            <div className="mt-1 text-xl font-bold text-[#17211B]">
              {formatNumber(result.baseline_blue_water_demand)}
              <span className="text-xs font-normal text-slate-500 ml-1">m³</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Optimized Blue Water Demand
            </span>
            <div className="mt-1 text-xl font-bold text-[#17211B]">
              {formatNumber(result.optimized_blue_water_demand)}
              <span className="text-xs font-normal text-emerald-700 ml-1">m³</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-stone-50/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Water Demand Delta
            </span>
            <div className="mt-1 text-xl font-bold text-[#17211B]">
              {formatNumber(result.water_demand_difference)}
              <span className="text-xs font-normal text-slate-500 ml-1">m³</span>
            </div>
            <span className="text-xs font-medium text-[#0F766E]">
              {formatPercent(result.water_demand_difference_percent ?? result.water_demand_difference_percentage, { showSign: true })}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-stone-50/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Crop Production Delta
            </span>
            <div className="mt-1 text-xl font-bold text-[#17211B]">
              {formatNumber(result.production_difference)}
              <span className="text-xs font-normal text-slate-500 ml-1">tonnes</span>
            </div>
            <span className="text-xs font-medium text-slate-600">
              {formatPercent(result.production_difference_percent ?? result.production_difference_percentage, { showSign: true })}
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736A] mb-3">
              Cultivated Crop Area Allocation (Hectares / %)
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis dataKey="crop" angle={-25} textAnchor="end" interval={0} height={40} fontSize={11} />
                  <YAxis tickFormatter={(v) => formatNumber(v, { compact: true })} fontSize={11} />
                  <Tooltip formatter={(val: any) => [formatNumber(Number(val)), 'Area']} />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 10 }} />
                  <Bar dataKey="baseline" name="Baseline Area" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimized" name="Optimized Area" fill="#14532D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736A] mb-3">
              Total Blue Water Demand (m³)
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterDemandData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis tickFormatter={(v) => formatNumber(v, { compact: true })} fontSize={11} />
                  <Tooltip formatter={(val: any) => [`${formatNumber(Number(val))} m³`, 'Blue Water Demand']} />
                  <Bar dataKey="demand" name="Modeled Blue Water Demand" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Constraints & Policy Notice */}
      <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 text-xs text-[#66736A] space-y-2">
        <div className="flex items-center gap-2 font-semibold text-[#17211B]">
          <ShieldCheck className="w-4 h-4 text-[#14532D]" />
          Agricultural Policy & Resource Governance Disclaimer
        </div>
        <p className="leading-relaxed">
          An optimized allocation represents the model&apos;s mathematical optimum under strictly specified constraints (linear programming using SciPy HiGHS solver). It is designed to inform transparent agricultural planning, not serve as a prescriptive top-down command without evaluating agrarian livelihoods and market supply chains.
        </p>
      </div>

      {/* Scientific Methodology and Assumptions */}
      <SourcePanel
        methodology={result.calculation_methodology}
        dataSources={result.data_sources}
        provenance={result.provenance}
        assumptions={result.assumptions}
        limitations={result.limitations}
      />
    </div>
  );
};
