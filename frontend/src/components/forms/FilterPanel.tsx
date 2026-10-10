import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  title?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title = 'Query & Filter Parameters',
  children,
  onApply,
  onReset,
  isLoading = false,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0F766E]" />
          <h3 className="text-sm font-semibold text-[#17211B]">{title}</h3>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-[#66736A] hover:text-[#17211B] font-medium transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </div>

      {onApply && (
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#14532D] text-white hover:bg-[#0F3D21] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isLoading ? 'Fetching Data...' : 'Apply Filters'}
          </button>
        </div>
      )}
    </div>
  );
};
