import React from 'react';
import type { CropShiftResult } from '../../types/api';
import { formatNumber, formatPercent, formatCropName } from '../../utils/formatters';
import { SourcePanel } from './SourcePanel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertCircle, FileCheck, ArrowRightLeft } from 'lucide-react';

interface ScenarioComparisonProps {
  result: CropShiftResult;
  onGenerateReceipt?: () => void;
  isGeneratingReceipt?: boolean;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  result,
  onGenerateReceipt,
  isGeneratingReceipt = false,
}) => {
  const chartData = [
    {
      crop: formatCropName(result.baseline_crop),
      type: 'Baseline',
      demand: result.baseline_demand || 0,
      yield: result.baseline_yield || 0,
      coefficient: result.baseline_blue_water_coefficient || 0,
    },
    {
      crop: formatCropName(result.alternative_crop),
      type: 'Alternative',
      demand: result.alternative_demand || 0,
      yield: result.alternative_yield || 0,
      coefficient: result.alternative_blue_water_coefficient || 0,
    },
  ];

  const diff = result.absolute_difference;
  const isLowerDemand = diff !== null && diff !== undefined && diff < 0;
  const isHigherDemand = diff !== null && diff !== undefined && diff > 0;

  return (
    <div className="space-y-6">
      {/* Primary Comparison Header */}
      <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
              Simulation Analysis Result
            </span>
            <h3 className="text-lg font-bold text-[#17211B] flex items-center gap-2 mt-0.5">
              <span>{formatCropName(result.baseline_crop)}</span>
              <ArrowRightLeft className="w-4 h-4 text-[#66736A]" />
              <span>{formatCropName(result.alternative_crop)}</span>
            </h3>
            <p className="text-xs text-[#66736A] mt-1">
              Region: <strong>{result.region}</strong> | Cultivated Area: <strong>{formatNumber(result.area_hectares)} ha</strong> | Period: <strong>{result.reference_year || 'Unspecified'}</strong>
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

        {/* 2-Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Baseline */}
          <div className="p-5 rounded-xl border border-slate-200 bg-stone-50/60">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Baseline: {formatCropName(result.baseline_crop)}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#17211B]">
                {formatNumber(result.baseline_demand)}
              </span>
              <span className="text-xs font-semibold text-[#0F766E]">{result.difference_unit} blue water</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-xs text-[#66736A]">
              <div className="flex justify-between">
                <span>Yield Assumption:</span>
                <span className="font-semibold text-[#17211B]">{formatNumber(result.baseline_yield)} {result.yield_unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Blue Water Intensity:</span>
                <span className="font-semibold text-[#17211B]">{formatNumber(result.baseline_blue_water_coefficient)} {result.coefficient_unit}</span>
              </div>
            </div>
          </div>

          {/* Alternative */}
          <div className="p-5 rounded-xl border border-slate-200 bg-stone-50/60">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Alternative: {formatCropName(result.alternative_crop)}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#17211B]">
                {formatNumber(result.alternative_demand)}
              </span>
              <span className="text-xs font-semibold text-[#0F766E]">{result.difference_unit} blue water</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-xs text-[#66736A]">
              <div className="flex justify-between">
                <span>Yield Assumption:</span>
                <span className="font-semibold text-[#17211B]">{formatNumber(result.alternative_yield)} {result.yield_unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Blue Water Intensity:</span>
                <span className="font-semibold text-[#17211B]">{formatNumber(result.alternative_blue_water_coefficient)} {result.coefficient_unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 8.6 Result Interpretation Notice */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Estimated change in blue-water demand under the stated scenario
          </h4>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-xs text-[#66736A] block">Absolute Difference:</span>
              <span className="text-lg font-bold text-[#17211B]">
                {formatNumber(result.absolute_difference)} {result.difference_unit}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#66736A] block">Relative Difference:</span>
              <span className="text-lg font-bold text-[#17211B]">
                {formatPercent(result.percentage_difference, { showSign: true })}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-[#66736A] leading-relaxed">
            {isLowerDemand &&
              'The modeled blue-water demand is lower under this alternative crop. This reduction is strictly conditional on the stated yield parameters and water-footprint coefficients. It does not certify that total groundwater extraction will unconditionally decrease without irrigation governance.'}
            {isHigherDemand &&
              'The modeled blue-water demand is higher under this alternative crop given the observed yields and irrigation requirements.'}
            {!isLowerDemand && !isHigherDemand &&
              'Modeled blue-water demand is identical between the baseline and alternative scenarios under the given parameters.'}
          </p>
        </div>

        {/* Comparison Bar Chart */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736A] mb-3">
            Blue Water Demand Comparison ({result.difference_unit})
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v) => formatNumber(v, { compact: true })} />
                <YAxis dataKey="crop" type="category" width={100} />
                <Tooltip
                  formatter={(val: any) => [`${formatNumber(Number(val))} ${result.difference_unit}`, 'Modeled Blue Water']}
                />
                <Legend />
                <Bar dataKey="demand" name="Estimated Blue Water Demand" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agronomic Suitability Status if returned */}
      {result.agronomic_suitability && Object.keys(result.agronomic_suitability).length > 0 && (
        <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            Agronomic Suitability & Soil Considerations
          </div>
          <p className="text-[11px] leading-relaxed">
            Crop-shift comparisons evaluate blue-water consumption. Before implementing crop substitution, verify local soil characteristics, agro-climatic zones, market procurement channels, and seasonal temperature thresholds.
          </p>
        </div>
      )}

      {/* Methodology & Provenance Details */}
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
