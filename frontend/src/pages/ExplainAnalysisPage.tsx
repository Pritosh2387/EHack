import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { explainAnalysis } from '../api/analysis';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { ProvenanceBadge } from '../components/feedback/ProvenanceBadge';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import {
  HelpCircle,
  Play,
  BookOpen,
  Database,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import type { ExplainResponse } from '../types/api';

export const ExplainAnalysisPage: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<string>('export_water_footprint');
  const [crop, setCrop] = useState<string>('rice');
  const [financialYear, setFinancialYear] = useState<string>('2020-21');
  const [region, setRegion] = useState<string>('Punjab');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);

  const explainMutation = useMutation({
    mutationFn: explainAnalysis,
    onSuccess: (data) => {
      setExplainData(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parameters: Record<string, any> = {};
    if (analysisType === 'export_water_footprint') {
      parameters.crop = crop;
      parameters.financial_year = financialYear;
    } else if (analysisType === 'crop_shift_scenario') {
      parameters.region = region;
      parameters.baseline_crop = 'rice';
      parameters.alternative_crop = 'wheat';
      parameters.area_hectares = 1000;
    } else {
      parameters.region = region;
      parameters.objective = 'minimize_blue_water';
    }

    explainMutation.mutate({
      analysis_type: analysisType,
      parameters,
    });
  };

  const exp = explainData?.explanation;

  return (
    <AppShell pageTitle="Explain Analysis">
      <PageHeader
        title="Scientific Explainability Engine"
        subtitle="Unpack the mathematical formulation, data provenance, scientific assumptions, and limitations behind every Water Shadow analytical output."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div>
          <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs sticky top-24">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <HelpCircle className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-[#17211B]">Select Analysis to Explain</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17211B] mb-1">Analysis Module</label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                >
                  <option value="export_water_footprint">Export Water Footprint Analysis</option>
                  <option value="crop_shift_scenario">Crop-Shift Scenario Simulation</option>
                  <option value="resource_optimization">Resource Allocation Optimization</option>
                </select>
              </div>

              {analysisType === 'export_water_footprint' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#17211B] mb-1">Target Commodity</label>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                    >
                      <option value="rice">Rice</option>
                      <option value="wheat">Wheat</option>
                      <option value="sugarcane">Sugarcane</option>
                      <option value="cotton">Cotton</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#17211B] mb-1">Financial Year</label>
                    <select
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value)}
                      className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                    >
                      <option value="2020-21">2020-21</option>
                      <option value="2019-20">2019-20</option>
                    </select>
                  </div>
                </>
              )}

              {analysisType !== 'export_water_footprint' && (
                <div>
                  <label className="block font-semibold text-[#17211B] mb-1">Regional Context</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[#E1E8E1] bg-white p-2.5 text-[#17211B]"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={explainMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#14532D] hover:bg-[#0F3D21] text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{explainMutation.isPending ? 'Generating Explanation...' : 'Explain Analysis'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Structured Explanation Sections (Section 11.2) */}
        <div className="lg:col-span-2 space-y-6">
          {explainMutation.isPending ? (
            <LoadingState message="Generating structured explanation from backend..." />
          ) : explainMutation.isError ? (
            <ErrorState
              title="Explanation Engine Error"
              message={(explainMutation.error as any)?.message || 'Could not query explanation engine.'}
            />
          ) : exp ? (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                    Scientific Explanation
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-[#17211B] font-mono">
                    {exp.analysis_type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#17211B] mb-3">
                  How This Calculation Works
                </h3>
                <p className="text-sm text-[#17211B] leading-relaxed">
                  {exp.explanation}
                </p>

                {/* Mathematical Formulation */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Governing Equation
                  </span>
                  <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 font-mono text-xs text-slate-900 font-medium">
                    {exp.methodology}
                  </div>
                </div>
              </div>

              {/* Data Sources & Provenance Ledger */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736A] flex items-center gap-1.5 mb-3">
                    <Database className="w-4 h-4 text-[#0F766E]" />
                    Underlying Data Sources
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                    {(exp.data_sources || []).map((ds, idx) => (
                      <li key={idx} className="leading-relaxed">{ds}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736A] flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-4 h-4 text-[#14532D]" />
                    Component Provenance
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(exp.provenance || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-xs p-2 rounded bg-stone-50 border border-stone-200">
                        <span className="font-semibold capitalize text-slate-700">{key.replace(/_/g, ' ')}</span>
                        <ProvenanceBadge provenance={val} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assumptions & Limitations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Model Assumptions
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                    {(exp.assumptions || []).map((a, idx) => (
                      <li key={idx} className="leading-relaxed">{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/50 rounded-xl border border-red-200 p-5 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Recognized Limitations
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-red-900">
                    {(exp.limitations || []).map((l, idx) => (
                      <li key={idx} className="leading-relaxed">{l}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Collapsible Technical Details Panel for Advanced Users */}
              <div className="rounded-xl border border-[#E1E8E1] bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#0F766E]" />
                    <span className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
                      Technical JSON Response Payload
                    </span>
                  </div>
                  {showTechnicalDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showTechnicalDetails && (
                  <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border-t border-slate-200">
                    <pre>{JSON.stringify(explainData, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-white border border-[#E1E8E1]">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17211B]">Explanation Ready</h3>
              <p className="text-xs text-[#66736A] mt-1 max-w-md mx-auto leading-relaxed">
                Select an analysis module from the menu to inspect its mathematical formulation, provenance taxonomy, assumptions, and limits.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
