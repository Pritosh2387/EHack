import React from 'react';
import { Menu, Activity, Database } from 'lucide-react';
import { StatusBadge } from '../feedback/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../../api/health';
import { fetchDataStatus } from '../../api/dataStatus';

interface TopBarProps {
  onOpenSidebar: () => void;
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSidebar, pageTitle }) => {
  const { data: health, isError: isHealthError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: dataStatus } = useQuery({
    queryKey: ['data-status'],
    queryFn: fetchDataStatus,
    refetchInterval: 60000,
    retry: 1,
  });

  const isHealthy = !isHealthError && health?.status === 'healthy';
  const overallDataStatus = dataStatus?.overall_status || 'unavailable';

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#E1E8E1] flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-[#66736A] hover:text-[#17211B] hover:bg-stone-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-[#17211B] truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Service Operational Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs">
          <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="text-[#66736A]">API:</span>
          <StatusBadge
            status={isHealthy ? 'healthy' : 'unavailable'}
            label={isHealthy ? 'Operational' : 'Disconnected'}
            size="sm"
          />
        </div>

        {/* Dataset Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs">
          <Database className="w-3.5 h-3.5 text-[#B45309]" />
          <span className="text-[#66736A] hidden md:inline">Datasets:</span>
          <StatusBadge
            status={overallDataStatus}
            label={
              overallDataStatus === 'available'
                ? 'All Ready'
                : overallDataStatus === 'partially_available'
                ? 'Partial'
                : 'Pending'
            }
            size="sm"
          />
        </div>
      </div>
    </header>
  );
};
