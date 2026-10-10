import React from 'react';
import { Info } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  unit?: string;
  source?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  unit,
  source,
  children,
  headerAction,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E1E8E1] p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#17211B]">{title}</h3>
              {unit && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {unit}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-[#66736A] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>

        <div className="w-full my-2">{children}</div>
      </div>

      {source && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#66736A]">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-[#0F766E]" />
            Source: {source}
          </span>
        </div>
      )}
    </div>
  );
};
