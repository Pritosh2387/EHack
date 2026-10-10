import React from 'react';
import { Database, FileQuestion, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  isMissingDataset?: boolean;
  missingDatasetName?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No validated data available for this selection',
  description,
  isMissingDataset = false,
  missingDatasetName,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  const defaultDescription = isMissingDataset
    ? `${missingDatasetName || 'The required dataset'} has not been loaded into the Water Shadow analytics service. Please refer to Data and Methodology to inspect dataset readiness.`
    : 'No records matched the filter criteria. Try adjusting the crop, year, or geographic filter.';

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white border border-[#E1E8E1] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-[#66736A] mb-4">
        {isMissingDataset ? <Database className="w-6 h-6 text-[#B45309]" /> : <FileQuestion className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#17211B] max-w-md">{title}</h3>
      <p className="text-sm text-[#66736A] mt-2 max-w-lg">{description || defaultDescription}</p>

      <div className="mt-6 flex items-center gap-3">
        {actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#14532D] text-white hover:bg-[#0F3D21] transition-colors"
          >
            <span>{actionText || 'Open Data & Methodology'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : onAction && actionText ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#14532D] text-white hover:bg-[#0F3D21] transition-colors"
          >
            {actionText}
          </button>
        ) : null}
      </div>
    </div>
  );
};
