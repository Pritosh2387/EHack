import React from 'react';

export type ProvenanceType =
  | 'OBSERVED'
  | 'PUBLISHED'
  | 'INFERRED'
  | 'SIMULATED'
  | 'OPTIMIZED'
  | string;

interface ProvenanceBadgeProps {
  provenance: ProvenanceType;
  label?: string;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  label,
  className = '',
}) => {
  const norm = (provenance || '').toUpperCase();
  const displayLabel = label || provenance || 'UNSPECIFIED';

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm.includes('OBSERVED')) {
    style = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (norm.includes('PUBLISHED')) {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (norm.includes('INFERRED')) {
    style = 'bg-purple-50 text-purple-800 border-purple-200';
  } else if (norm.includes('SIMULATED') || norm.includes('OPTIMIZED')) {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase border ${style} ${className}`}
      title={`Data Provenance: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
};
