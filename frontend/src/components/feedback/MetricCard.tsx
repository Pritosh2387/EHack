import React from 'react';
import { Info } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { formatNumber } from '../../utils/formatters';

interface MetricCardProps {
  label: string;
  value?: number | null;
  unit?: string;
  period?: string | null;
  provenance?: string;
  tooltip?: string;
  isUnavailable?: boolean;
  unavailableReason?: string;
  decimals?: number;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  period,
  provenance,
  tooltip,
  isUnavailable = false,
  unavailableReason = 'Unavailable — source data not loaded',
  decimals = 2,
  icon,
  className = '',
}) => {
  const hasValue = value !== undefined && value !== null && !isNaN(value);

  return (
    <div
      className={`bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs transition-shadow hover:shadow-sm flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-[#0F766E]">{icon}</div>}
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66736A]">{label}</span>
          </div>
          {tooltip && (
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-[#66736A] hover:text-[#17211B] cursor-help transition-colors" />
              <div className="absolute right-0 top-5 z-20 hidden group-hover:block w-56 p-2 text-xs text-white bg-slate-900 rounded-lg shadow-lg pointer-events-none">
                {tooltip}
              </div>
            </div>
          )}
        </div>

        {isUnavailable || !hasValue ? (
          <div className="my-3 py-2 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-[#66736A]">
            {unavailableReason}
          </div>
        ) : (
          <div className="my-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold tracking-tight text-[#17211B]">
              {formatNumber(value, { decimals })}
            </span>
            {unit && <span className="text-sm font-medium text-[#0F766E]">{unit}</span>}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#66736A] flex-wrap gap-2">
        <span>{period ? `Period: ${period}` : 'No reporting period'}</span>
        {provenance && <ProvenanceBadge provenance={provenance} />}
      </div>
    </div>
  );
};
