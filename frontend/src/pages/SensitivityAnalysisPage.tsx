import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { runSensitivityAnalysis } from '../api/analysis';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, type Column } from '../components/tables/DataTable';
import { ChartCard } from '../components/charts/ChartCard';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { formatNumber, formatPercent } from '../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Play, Info } from 'lucide-react';
import type { SensitivityResult, SensitivityStep } from '../types/api';

export const SensitivityAnalysisPage: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<string>('crop_shift');
  const [parameterToVary, setParameterToVary] = useState<string>('yield');
  const [baselineValue, setBaselineValue] = useState<string>('3.5');
  const [variationPercent, setVariationPercent] = useState<string>('15');
  const [steps, setSteps] = useState<string>('5');

  const [activeResult, setActiveResult] = useState<SensitivityResult | null>(null);

  const sensitivityMutation = useMutation({
    mutationFn: runSensitivityAnalysis,
    onSuccess: (data) => {
      setActiveResult(data.result);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseline = parseFloat(baselineValue);
    const variation = parseFloat(variationPercent);
    const stepsCount = parseInt(steps, 10);

    sensitivityMutation.mutate({
      analysis_type: analysisType,
      parameter_to_vary: parameterToVary,
      baseline_value: !isNaN(baseline) ? baseline : 1.0,
      variation_percent: !isNaN(variation) ? variation : 10.0,
      steps: !isNaN(stepsCount) ? stepsCount : 5,
    });
  };

  const chartData = (activeResult?.results || []).map((step) => ({
    name: `${step.parameter_change_percent > 0 ? '+' : ''}${step.parameter_change_percent.toFixed(1)}%`,
    value: step.parameter_value,
    step: step.step,
  }));

  const columns: Column<SensitivityStep>[] = [
    { key: 'step', header: 'Step Index', align: 'center' },
    {
      key: 'parameter_change_percent',
      header: 'Parameter Variation',
      align: 'right',
      render: (s) => (
        <span className="font-semibold text-slate-900">
          {formatPercent(s.parameter_change_percent, { showSign: true })}
        </span>
      ),
    },
    {
      key: 'parameter_value',
      header: 'Simulated Value',
      align: 'right',
      render: (s) => (
        <span className="font-mono text-[#0F766E] font-medium">
          {formatNumber(s.parameter_value, { decimals: 4 })}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Step Description',
      render: (s) => <span className="text-[#66736A]">{s.notes || '—'}</span>,
    },
  ];

  return (
    <AppShell pageTitle="Sensitivity Analysis">
      <PageHeader
        title="Parameter Sensitivity Analysis"
        subtitle="Evaluate how analytical outputs change when model parameters vary within specified percentage bands."
      />

      {/* Statistical Caveat Notice (Section 10.3) */}
      <div className="mb-6 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Methodology Notice:</strong> These sensitivity variations demonstrate parameter elasticity under deterministic adjustments. In accordance with Section 10.3 of the specification, sensitivity ranges are strictly not labeled as statistical confidence intervals because they reflect systematic parameter shifts rather than empirically validated sampling distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Form */}
        <div>
          <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs sticky top-24">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-[#17211B]">Sensitivity Settings</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Analysis Type</label>
                <select
                  value={analysisType}
                  onChange={(e) => {
                    const next = e.target.value;
                    setAnalysisType(next);
                    if (next === 'crop_shift') setParameterToVary('yield');
                    else setParameterToVary('water_coefficient');
                  }}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  <option value="crop_shift">Crop-Shift Scenario</option>
                  <option value="export_water_footprint">Export Water Footprint</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Parameter to Vary</label>
                <select
                  value={parameterToVary}
                  onChange={(e) => setParameterToVary(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  {analysisType === 'crop_shift' ? (
                    <>
                      <option value="yield">Crop Yield (tonnes/ha)</option>
                      <option value="water_coefficient">Blue Water Coefficient (m³/tonne)</option>
                    </>
                  ) : (
                    <>
                      <option value="water_coefficient">Water Footprint Coefficient (m³/tonne)</option>
                      <option value="export_quantity">Export Quantity (tonnes)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Baseline Value</label>
                <input
                  type="number"
                  step="any"
                  value={baselineValue}
                  onChange={(e) => setBaselineValue(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17211B] mb-1">Variation (±%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={variationPercent}
                    onChange={(e) => setVariationPercent(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17211B] mb-1">Steps per side</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sensitivityMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#14532D] hover:bg-[#0F3D21] text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{sensitivityMutation.isPending ? 'Calculating...' : 'Run Sensitivity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {sensitivityMutation.isPending ? (
            <LoadingState message="Executing sensitivity parameter variation on backend..." />
          ) : sensitivityMutation.isError ? (
            <ErrorState
              title="Sensitivity Analysis Error"
              message={(sensitivityMutation.error as any)?.message || 'Failed to complete sensitivity run.'}
            />
          ) : activeResult ? (
            <div className="space-y-6">
              {/* Line Chart */}
              <ChartCard
                title={`Sensitivity Response: ${activeResult.parameter_name}`}
                subtitle={`Baseline value: ${activeResult.baseline_value} (±${activeResult.variation_percent}%)`}
                unit="value"
                source={activeResult.methodology}
              >
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis domain={['auto', 'auto']} tickFormatter={(v) => formatNumber(v, { decimals: 2 })} fontSize={11} />
                      <Tooltip formatter={(val: any) => [formatNumber(Number(val), { decimals: 4 }), 'Parameter Value']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Varied Parameter"
                        stroke="#0F766E"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#14532D' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Steps Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A]">
                  Stepwise Variation Ledger
                </h3>
                <DataTable
                  data={activeResult.results || []}
                  columns={columns}
                  keyExtractor={(s) => s.step}
                />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-white border border-[#E1E8E1]">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17211B]">Sensitivity Model Ready</h3>
              <p className="text-xs text-[#66736A] mt-1 max-w-md mx-auto leading-relaxed">
                Choose an analysis type and parameter to vary to observe step-by-step impact across percentage increments.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
