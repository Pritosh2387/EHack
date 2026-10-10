import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records available.',
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`overflow-x-auto rounded-xl border border-[#E1E8E1] bg-white ${className}`}>
        <table className="min-w-full divide-y divide-[#E1E8E1] text-left text-xs">
          <thead className="bg-[#F7F9F6]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold text-[#66736A]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`p-8 text-center text-xs text-[#66736A] rounded-xl border border-[#E1E8E1] bg-white ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-[#E1E8E1] bg-white shadow-xs ${className}`}>
      <table className="min-w-full divide-y divide-[#E1E8E1] text-left text-xs">
        <thead className="bg-[#F7F9F6]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-semibold text-[#66736A] uppercase tracking-wider text-[11px] ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E1E8E1] bg-white text-[#17211B]">
          {data.map((item, index) => (
            <tr key={keyExtractor(item, index)} className="hover:bg-emerald-50/20 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.render ? col.render(item, index) : (item as any)[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
