import React from 'react';
import type { DatasetInfo } from '../../types/api';
import { StatusBadge } from '../feedback/StatusBadge';

export interface DatasetTableItem extends DatasetInfo {
  row_count?: number;
  errors?: string[];
  coverage_notes?: string;
}

interface DatasetTableProps {
  datasets: DatasetTableItem[];
  isLoading?: boolean;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({ datasets, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-xs text-[#66736A]">Loading dataset registry...</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E1E8E1] bg-white shadow-xs">
      <table className="min-w-full divide-y divide-[#E1E8E1] text-xs">
        <thead className="bg-[#F7F9F6] text-[#66736A] uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-4 py-3 text-left">Dataset</th>
            <th className="px-4 py-3 text-left">Source Agency</th>
            <th className="px-4 py-3 text-left">Period</th>
            <th className="px-4 py-3 text-left">Coverage</th>
            <th className="px-4 py-3 text-left">Records</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-left">Standard Units</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {datasets.map((d) => (
            <tr key={d.name} className="hover:bg-stone-50 transition-colors">
              <td className="px-4 py-3.5 font-semibold text-[#17211B] capitalize">
                {d.name.replace(/_/g, ' ')}
                <span className="block text-[11px] font-normal text-[#66736A]">{d.description}</span>
              </td>
              <td className="px-4 py-3.5 text-[#17211B]">{d.source}</td>
              <td className="px-4 py-3.5 text-[#66736A]">{d.period}</td>
              <td className="px-4 py-3.5 text-[#66736A]">{d.geographic_coverage}</td>
              <td className="px-4 py-3.5 text-[#17211B] font-mono">
                {d.available && d.row_count !== undefined && d.row_count !== null ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                    {d.row_count} {d.row_count === 1 ? 'row' : 'rows'}
                  </span>
                ) : (
                  <span className="text-stone-400">—</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-center">
                <StatusBadge
                  status={d.available ? 'ready' : 'unavailable'}
                  label={d.available ? 'Ready' : 'Pending'}
                />
              </td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(d.units || {}).map(([dim, u]) => (
                    <span key={dim} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                      {dim}: {u}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
