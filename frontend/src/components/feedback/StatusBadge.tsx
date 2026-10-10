import React from 'react';

export type StatusType =
  | 'healthy'
  | 'operational'
  | 'available'
  | 'partially_available'
  | 'unavailable'
  | 'validation_failed'
  | 'error'
  | 'safe'
  | 'semi-critical'
  | 'critical'
  | 'over-exploited'
  | 'saline'
  | 'feasible'
  | 'infeasible'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const norm = (status || '').toLowerCase().replace(/_/g, '-');
  const displayLabel = label || status || 'Unknown';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (norm === 'healthy' || norm === 'operational' || norm === 'available' || norm === 'safe' || norm === 'feasible') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'partially-available' || norm === 'semi-critical' || norm === 'warning') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (norm === 'critical') {
    colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
    dotColor = 'bg-orange-500';
  } else if (norm === 'over-exploited' || norm === 'unavailable' || norm === 'validation-failed' || norm === 'error' || norm === 'infeasible') {
    colorClasses = 'bg-red-50 text-red-800 border-red-200';
    dotColor = 'bg-red-500';
  } else if (norm === 'saline') {
    colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} ${className}`}
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
};
