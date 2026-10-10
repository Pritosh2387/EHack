import React, { useState } from 'react';
import type { ReceiptResponse } from '../../types/api';
import { formatDate } from '../../utils/formatters';
import { ProvenanceBadge } from './ProvenanceBadge';
import { Copy, Check, Printer, FileText, Share2, Info } from 'lucide-react';

interface DecisionReceiptViewProps {
  receipt: ReceiptResponse;
  className?: string;
}

export const DecisionReceiptView: React.FC<DecisionReceiptViewProps> = ({
  receipt,
  className = '',
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(receipt.receipt_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`bg-white rounded-xl border border-[#E1E8E1] shadow-xs overflow-hidden print:border-none print:shadow-none ${className}`}>
      {/* Receipt Top Header */}
      <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
              Traceable Decision Receipt
            </span>
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-white">
            ID: {receipt.receipt_id.slice(0, 18)}...
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generated: {formatDate(receipt.timestamp || receipt.generated_at)} | Engine Version: {receipt.methodology_version}
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied JSON' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Scientific Integrity Notice */}
      <div className="px-6 py-3 bg-stone-50 border-b border-[#E1E8E1] text-[11px] text-[#66736A] flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
        <span>
          This verifiable audit record records parameters, methodology, and data sources for reproducible environmental research. It reflects analytical model calculations and does not constitute official certification.
        </span>
      </div>

      <div className="p-6 space-y-6 text-xs">
        {/* Core Analysis Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Analysis Class
            </span>
            <span className="font-semibold text-sm text-[#17211B] capitalize">
              {receipt.analysis_type.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Full Receipt Identifier
            </span>
            <span className="font-mono text-xs text-slate-800 select-all break-all">
              {receipt.receipt_id}
            </span>
          </div>
        </div>

        {/* Input Parameters */}
        <div>
          <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-slate-500">
            Input Parameters
          </h4>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] overflow-x-auto">
            <pre className="text-slate-800">{JSON.stringify(receipt.parameters, null, 2)}</pre>
          </div>
        </div>

        {/* Structured Results */}
        <div>
          <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-slate-500">
            Computed Output & Metrics
          </h4>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] overflow-x-auto">
            <pre className="text-slate-800">{JSON.stringify(receipt.result_data, null, 2)}</pre>
          </div>
        </div>

        {/* Methodology Formulation */}
        <div>
          <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-slate-500">
            Calculation Methodology
          </h4>
          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-slate-800 leading-relaxed font-mono text-[11px]">
            {receipt.calculation_methodology}
          </div>
        </div>

        {/* Data Sources & Provenance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-slate-500">
              Data Sources
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 bg-stone-50/50 p-3 rounded-lg border border-stone-200">
              {receipt.data_sources.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-slate-500">
              Component Provenance
            </h4>
            <div className="space-y-1.5 bg-stone-50/50 p-3 rounded-lg border border-stone-200">
              {Object.entries(receipt.provenance || {}).map(([dim, prov]) => (
                <div key={dim} className="flex items-center justify-between">
                  <span className="capitalize font-medium text-slate-700">{dim.replace(/_/g, ' ')}</span>
                  <ProvenanceBadge provenance={prov} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assumptions & Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-slate-500">
              Scientific Assumptions
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 bg-stone-50/50 p-3 rounded-lg border border-stone-200">
              {receipt.assumptions.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#17211B] uppercase tracking-wider text-[11px] mb-2 text-red-700">
              Known Limitations
            </h4>
            <ul className="list-disc list-inside space-y-1 text-red-800 bg-red-50/40 p-3 rounded-lg border border-red-200">
              {receipt.limitations.map((l, idx) => (
                <li key={idx}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
