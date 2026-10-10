import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createDecisionReceipt } from '../api/receipts';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { DecisionReceiptView } from '../components/feedback/DecisionReceiptView';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { FileText, PlusCircle, History } from 'lucide-react';
import type { ReceiptResponse } from '../types/api';

export const DecisionReceiptsPage: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<string>('crop_shift_scenario');
  const [customParams, setCustomParams] = useState<string>(
    JSON.stringify(
      {
        region: 'Punjab',
        baseline_crop: 'rice',
        alternative_crop: 'wheat',
        area_hectares: 1000,
        reference_year: '2020-21',
      },
      null,
      2
    )
  );
  const [customResultData, setCustomResultData] = useState<string>(
    JSON.stringify(
      {
        baseline_demand: 2400000,
        alternative_demand: 1800000,
        absolute_difference: -600000,
        percentage_difference: -25.0,
        difference_unit: 'm³',
      },
      null,
      2
    )
  );

  const [parseError, setParseError] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptResponse | null>(null);
  const [sessionReceipts, setSessionReceipts] = useState<ReceiptResponse[]>([]);

  const receiptMutation = useMutation({
    mutationFn: createDecisionReceipt,
    onSuccess: (data) => {
      setActiveReceipt(data);
      setSessionReceipts((prev) => [data, ...prev.slice(0, 9)]);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setParseError(null);

    try {
      const paramsObj = JSON.parse(customParams);
      const resultObj = JSON.parse(customResultData);

      receiptMutation.mutate({
        analysis_type: analysisType,
        parameters: paramsObj,
        result_data: resultObj,
      });
    } catch (err: any) {
      setParseError(`JSON Parsing Error: ${err.message}`);
    }
  };

  const handleSetExample = (type: string) => {
    setAnalysisType(type);
    if (type === 'export_water_footprint') {
      setCustomParams(
        JSON.stringify({ crop: 'rice', financial_year: '2020-21', water_component: 'all' }, null, 2)
      );
      setCustomResultData(
        JSON.stringify(
          {
            export_quantity: 5000,
            estimated_green_water: 7500000,
            estimated_blue_water: 4000000,
            estimated_grey_water: 1500000,
            footprint_unit: 'm³',
          },
          null,
          2
        )
      );
    } else if (type === 'resource_optimization') {
      setCustomParams(
        JSON.stringify({ region: 'Punjab', objective: 'minimize_blue_water', time_period: '2020-21' }, null, 2)
      );
      setCustomResultData(
        JSON.stringify(
          {
            baseline_allocation: { rice: 50, wheat: 50 },
            optimized_allocation: { rice: 20, wheat: 80 },
            water_demand_difference: -350000,
            water_demand_difference_percent: -14.5,
          },
          null,
          2
        )
      );
    } else {
      setCustomParams(
        JSON.stringify(
          { region: 'Punjab', baseline_crop: 'rice', alternative_crop: 'wheat', area_hectares: 1000 },
          null,
          2
        )
      );
      setCustomResultData(
        JSON.stringify(
          {
            baseline_demand: 2400000,
            alternative_demand: 1800000,
            absolute_difference: -600000,
            percentage_difference: -25.0,
            difference_unit: 'm³',
          },
          null,
          2
        )
      );
    }
  };

  return (
    <AppShell pageTitle="Decision Receipts">
      <PageHeader
        title="Traceable Decision Receipts"
        subtitle="Cryptographically identified receipts recording calculation parameters, provenances, and methodologies for reproducible academic evaluation and auditability."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <PlusCircle className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-[#17211B]">Receipt Generation Engine</h3>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Preset Example
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetExample('crop_shift_scenario')}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    analysisType === 'crop_shift_scenario'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Crop Shift
                </button>
                <button
                  type="button"
                  onClick={() => handleSetExample('export_water_footprint')}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    analysisType === 'export_water_footprint'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Export Footprint
                </button>
                <button
                  type="button"
                  onClick={() => handleSetExample('resource_optimization')}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    analysisType === 'resource_optimization'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Optimization
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {parseError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-[11px]">
                  {parseError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Analysis Type</label>
                <input
                  type="text"
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2 text-[#17211B] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">
                  Parameters JSON Payload
                </label>
                <textarea
                  rows={4}
                  value={customParams}
                  onChange={(e) => setCustomParams(e.target.value)}
                  className="w-full text-[11px] rounded-lg border border-[#E1E8E1] bg-slate-50 p-2 text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17211B] mb-1">
                  Result Data JSON Payload
                </label>
                <textarea
                  rows={4}
                  value={customResultData}
                  onChange={(e) => setCustomResultData(e.target.value)}
                  className="w-full text-[11px] rounded-lg border border-[#E1E8E1] bg-slate-50 p-2 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={receiptMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0c5c56] text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{receiptMutation.isPending ? 'Minting Receipt...' : 'Generate New Receipt'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Session Receipts History */}
          {sessionReceipts.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs text-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-[#17211B]">
                  <History className="w-4 h-4 text-[#0F766E]" />
                  <span>Recent Receipts ({sessionReceipts.length})</span>
                </div>
                <span className="text-[10px] text-slate-500">In-memory session</span>
              </div>

              <div className="space-y-2">
                {sessionReceipts.map((r) => (
                  <button
                    key={r.receipt_id}
                    type="button"
                    onClick={() => setActiveReceipt(r)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      activeReceipt?.receipt_id === r.receipt_id
                        ? 'border-[#0F766E] bg-teal-50/50'
                        : 'border-slate-100 hover:border-slate-200 bg-stone-50/30'
                    }`}
                  >
                    <div className="font-mono font-semibold text-xs text-[#17211B] truncate">
                      {r.receipt_id.slice(0, 16)}...
                    </div>
                    <div className="text-[11px] text-[#66736A] capitalize mt-0.5">
                      {r.analysis_type.replace(/_/g, ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Receipt View */}
        <div className="lg:col-span-2 space-y-6">
          {receiptMutation.isPending ? (
            <LoadingState message="Connecting to POST /api/v1/receipts/ to construct receipt..." />
          ) : receiptMutation.isError ? (
            <ErrorState
              title="Receipt Creation Failed"
              message={(receiptMutation.error as any)?.message || 'Failed to mint receipt from backend.'}
            />
          ) : activeReceipt ? (
            <DecisionReceiptView receipt={activeReceipt} />
          ) : (
            <div className="p-12 text-center rounded-xl bg-white border border-[#E1E8E1]">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#14532D] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17211B]">Decision Receipt Ready</h3>
              <p className="text-xs text-[#66736A] mt-1 max-w-md mx-auto leading-relaxed">
                Click &quot;Generate New Receipt&quot; to mint an authoritative verifiable receipt from the FastAPI service via POST /api/v1/receipts/.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
