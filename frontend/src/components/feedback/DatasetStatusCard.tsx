import React from 'react';
import { Database } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface DatasetStatusCardProps {
  name: string;
  available: boolean;
  source?: string;
  description?: string;
  period?: string;
  geographicScope?: string;
  units?: Record<string, string>;
  columns?: string[];
  limitations?: string[];
  rowCount?: number;
  errors?: string[];
  coverageNotes?: string;
  className?: string;
}

export const DatasetStatusCard: React.FC<DatasetStatusCardProps> = ({
  name,
  available,
  source,
  description,
  period,
  geographicScope,
  units,
  columns,
  limitations,
  rowCount,
  errors,
  coverageNotes,
  className = '',
}) => {
  const formattedName = name.replace(/_/g, ' ');

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
        available ? 'border-emerald-200' : 'border-[#E1E8E1]'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              available ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-[#66736A]'
            }`}
          >
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#17211B] capitalize">{formattedName}</h3>
            {source && <p className="text-xs text-[#66736A]">{source}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {available && rowCount !== undefined && rowCount !== null && (
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {rowCount} {rowCount === 1 ? 'row' : 'rows'}
            </span>
          )}
          <StatusBadge
            status={available ? 'ready' : 'unavailable'}
            label={available ? 'Loaded' : 'Pending File'}
          />
        </div>
      </div>

      {description && <p className="text-xs text-[#66736A] mb-3">{description}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs py-2 border-t border-slate-100">
        <div>
          <span className="text-[#66736A] block">Period:</span>
          <span className="font-medium text-[#17211B]">{period || 'Historical / Periodic'}</span>
        </div>
        <div>
          <span className="text-[#66736A] block">Scope:</span>
          <span className="font-medium text-[#17211B]">{geographicScope || 'National (India)'}</span>
        </div>
        <div>
          <span className="text-[#66736A] block">Records:</span>
          <span className="font-medium text-[#17211B] font-mono">
            {available && rowCount !== undefined && rowCount !== null
              ? `${rowCount} loaded`
              : 'Pending ingestion'}
          </span>
        </div>
      </div>

      {coverageNotes && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[#66736A] block mb-0.5 font-semibold">Coverage Scope:</span>
          <p className="text-[11px] text-stone-600 leading-relaxed">{coverageNotes}</p>
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="mt-2 pt-2 border-t border-red-100 text-xs text-red-800 bg-red-50/60 p-2.5 rounded-lg border">
          <span className="font-semibold block mb-0.5">Validation Errors:</span>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, idx) => (
              <li key={idx} className="text-[11px] leading-relaxed">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {units && Object.keys(units).length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[#66736A] block mb-1">Standard Units:</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(units).map(([k, u]) => (
              <span key={k} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                {k}: <strong>{u}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {columns && columns.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[#66736A] block mb-1">Expected Columns:</span>
          <div className="flex flex-wrap gap-1">
            {columns.map((c) => (
              <span key={c} className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] text-stone-700 font-mono">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {limitations && limitations.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-amber-800 bg-amber-50/50 p-2 rounded">
          <span className="font-semibold block mb-0.5">Known Limitations:</span>
          <ul className="list-disc list-inside space-y-0.5">
            {limitations.map((lim, idx) => (
              <li key={idx} className="text-[11px] leading-relaxed">
                {lim}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
