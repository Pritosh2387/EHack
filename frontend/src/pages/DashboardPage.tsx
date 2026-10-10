import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../api/health';
import { fetchMetadata } from '../api/metadata';
import { fetchDataStatus } from '../api/dataStatus';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/feedback/MetricCard';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { Link } from 'react-router-dom';
import {
  Wheat,
  MapPin,
  Activity,
  ArrowRight,
  Database,
  Ship,
  Map as MapIcon,
  ArrowRightLeft,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  const { data: metadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });

  const { data: dataStatus, isLoading: isStatusLoading, isError: isStatusError, refetch: refetchStatus } = useQuery({
    queryKey: ['data-status'],
    queryFn: fetchDataStatus,
  });

  const isDataAvailable = dataStatus?.overall_status === 'available';
  const hasPartialData = dataStatus?.overall_status === 'partially_available';

  return (
    <AppShell pageTitle="Dashboard">
      <PageHeader
        title="Water Shadow"
        subtitle="Understand agricultural water footprints. Explore regional water stress. Evaluate alternative cropping strategies."
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={health?.status === 'healthy' ? 'operational' : 'unavailable'}
              label={health?.status === 'healthy' ? 'API Operational' : 'Service Offline'}
            />
            {dataStatus && (
              <StatusBadge
                status={dataStatus.overall_status}
                label={
                  dataStatus.overall_status === 'available'
                    ? 'Datasets Loaded'
                    : dataStatus.overall_status === 'partially_available'
                    ? 'Partially Ready'
                    : 'Source Data Not Loaded'
                }
              />
            )}
          </div>
        }
      />

      {/* Backend & Dataset Status Banner */}
      <div className="mb-6 p-4 rounded-xl border border-[#E1E8E1] bg-white shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDataAvailable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isDataAvailable ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17211B]">
                {isDataAvailable
                  ? 'All Agricultural & Hydrogeological Datasets Loaded'
                  : hasPartialData
                  ? 'Partial Datasets Loaded into Analytics Service'
                  : 'Dataset Ingestion Status: Awaiting Raw Source Data Files'}
              </h3>
              <p className="text-xs text-[#66736A] mt-1 max-w-3xl leading-relaxed">
                {isDataAvailable
                  ? 'Real data from TradeStat, CGWB, and MoAFW are active. All analytical calculators and optimizers are ready for scenario execution.'
                  : 'The FastAPI analytics engine is running, but real datasets (.csv or .xlsx) have not yet been placed in ml_service/data. To ensure scientific integrity, the platform will never fabricate placeholder figures. Refer to Data & Methodology for details.'}
              </p>
            </div>
          </div>
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-[#17211B] transition-colors shrink-0"
          >
            <Database className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Inspect Datasets</span>
          </Link>
        </div>
      </div>

      {/* Primary Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Supported Commodities"
          value={metadata?.supported_crops?.length}
          unit="crops"
          period="Reference standard"
          provenance="PUBLISHED"
          tooltip="Recognized agricultural commodities registered in the Water Shadow analytical dictionary."
          icon={<Wheat className="w-4 h-4" />}
          decimals={0}
        />

        <MetricCard
          label="Supported Administrative States"
          value={metadata?.supported_regions?.length}
          unit="states / UTs"
          period="National coverage"
          provenance="OBSERVED"
          tooltip="Standard Indian administrative state boundaries supported by crop production models."
          icon={<MapPin className="w-4 h-4" />}
          decimals={0}
        />

        <MetricCard
          label="Analytical Capabilities"
          value={metadata?.supported_analysis_types?.length}
          unit="modules"
          period="Active"
          provenance="INFERRED"
          tooltip="Supported analytical workflows: export footprints, crop shift, groundwater stress, resource optimization, and sensitivity."
          icon={<Activity className="w-4 h-4" />}
          decimals={0}
        />

        <MetricCard
          label="Groundwater Assessment Units"
          value={isDataAvailable ? 1 : null}
          isUnavailable={!isDataAvailable}
          unavailableReason="Unavailable — source data not loaded"
          unit="blocks / units"
          period="Official CGWB"
          provenance="OBSERVED"
          tooltip="Assessed groundwater extraction units categorized as Safe, Semi-Critical, Critical, Over-Exploited, or Saline."
          icon={<Database className="w-4 h-4" />}
          decimals={0}
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A] mb-3">
          Analytical Exploration Workflows
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/exports"
            className="group p-5 bg-white rounded-xl border border-[#E1E8E1] hover:border-[#14532D] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#14532D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Ship className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#17211B] group-hover:text-[#14532D] transition-colors">
                Export Water Footprint
              </h4>
              <p className="text-xs text-[#66736A] mt-1.5 leading-relaxed">
                Explore estimated green, blue, and grey water volumes embedded in India&apos;s agricultural export quantities.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#14532D] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Explore Exports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/regions"
            className="group p-5 bg-white rounded-xl border border-[#E1E8E1] hover:border-[#0F766E] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MapIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#17211B] group-hover:text-[#0F766E] transition-colors">
                Regional Explorer
              </h4>
              <p className="text-xs text-[#66736A] mt-1.5 leading-relaxed">
                Examine regional crop production alongside official CGWB groundwater stress assessments.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0F766E] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Regional View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/crop-shift"
            className="group p-5 bg-white rounded-xl border border-[#E1E8E1] hover:border-[#2563EB] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#17211B] group-hover:text-[#2563EB] transition-colors">
                Crop-Shift Simulator
              </h4>
              <p className="text-xs text-[#66736A] mt-1.5 leading-relaxed">
                Model blue-water demand transitions between baseline and alternative crops under stated assumptions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#2563EB] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Start Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/optimization"
            className="group p-5 bg-white rounded-xl border border-[#E1E8E1] hover:border-[#2E7D5B] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#2E7D5B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#17211B] group-hover:text-[#2E7D5B] transition-colors">
                Resource Optimization
              </h4>
              <p className="text-xs text-[#66736A] mt-1.5 leading-relaxed">
                Solve linear programming models to minimize blue-water demand under land and production constraints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#2E7D5B] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Run Optimization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Dataset Readiness Detail Matrix */}
      <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#17211B]">Core Environmental Dataset Registry</h3>
            <p className="text-xs text-[#66736A]">
              Real-time ingestion and validation status from /api/v1/data-status
            </p>
          </div>
          <span className="text-xs text-[#66736A]">
            Last updated: {dataStatus?.last_updated || 'Active'}
          </span>
        </div>

        {isStatusLoading ? (
          <LoadingState inline message="Checking dataset files..." />
        ) : isStatusError ? (
          <ErrorState message="Could not query data status from backend service." onRetry={() => refetchStatus()} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(dataStatus?.datasets || []).map((ds) => (
              <div
                key={ds.name}
                className="p-4 rounded-xl border border-[#E1E8E1] bg-stone-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#17211B] capitalize">
                      {ds.name.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge
                      status={ds.available ? 'available' : 'unavailable'}
                      label={ds.available ? 'Ready' : 'Pending'}
                      size="sm"
                    />
                  </div>
                  <p className="text-[11px] text-[#66736A] line-clamp-2">{ds.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-[#66736A]">
                  Source: {ds.source}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};
