import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface SourcePanelProps {
  methodology?: string;
  dataSources?: string[];
  provenance?: Record<string, string>;
  assumptions?: string[];
  limitations?: string[];
  geographicScope?: string;
  defaultOpen?: boolean;
  className?: string;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  methodology,
  dataSources = [],
  provenance = {},
  assumptions = [],
  limitations = [],
  geographicScope,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border border-[#E1E8E1] bg-white overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-stone-50/50 hover:bg-stone-50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0F766E]" />
          <span className="text-sm font-semibold text-[#17211B]">
            Scientific Source, Methodology & Provenance
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#66736A]">
          <span>{isOpen ? 'Collapse' : 'Expand details'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[#E1E8E1] space-y-4 text-xs">
          {geographicScope && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Geographic Scope Notice:</strong>
                <span>
                  Coefficients are based on <strong>{geographicScope}</strong>. If global estimates are applied, they represent indicative international benchmarks rather than localized field-scale groundwater abstractions.
                </span>
              </div>
            </div>
          )}

          {methodology && (
            <div>
              <h4 className="font-semibold text-[#17211B] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider text-slate-500">
                <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                Calculation Formulation
              </h4>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 leading-relaxed">
                {methodology}
              </p>
            </div>
          )}

          {dataSources.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Authoritative Data Sources</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {dataSources.map((source, idx) => (
                  <li key={idx}>{source}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(provenance).length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-2">Provenance Ledger</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(provenance).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200">
                    <span className="font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                    <ProvenanceBadge provenance={val} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {assumptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Core Scientific Assumptions</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {assumptions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {limitations.length > 0 && (
            <div className="p-3 bg-red-50/50 border border-red-200 rounded text-red-900">
              <h4 className="font-semibold uppercase tracking-wider mb-1 text-red-800">Analytical Limitations</h4>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                {limitations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
