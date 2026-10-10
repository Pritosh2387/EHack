import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from '../api/metadata';
import { fetchDataStatus } from '../api/dataStatus';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { DatasetStatusCard } from '../components/feedback/DatasetStatusCard';
import { DatasetTable } from '../components/tables/DatasetTable';
import { MethodologyPanel } from '../components/feedback/MethodologyPanel';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export const DataMethodologyPage: React.FC = () => {
  const {
    data: metadata,
    isLoading: isMetaLoading,
    isError: isMetaError,
    error: metaError,
    refetch: refetchMeta,
  } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });

  const {
    data: dataStatus,
    isLoading: isStatusLoading,
  } = useQuery({
    queryKey: ['data-status'],
    queryFn: fetchDataStatus,
  });

  const isDataAvailable = dataStatus?.overall_status === 'available';

  return (
    <AppShell pageTitle="Data & Methodology">
      <PageHeader
        title="Scientific Data Provenance & Methodology"
        subtitle="Complete transparency into the underlying agricultural datasets, ingestion status, validation pipelines, and hydrological estimation models."
        badge={
          dataStatus && (
            <StatusBadge
              status={dataStatus.overall_status}
              label={
                isDataAvailable
                  ? 'All Datasets Verified'
                  : dataStatus.overall_status === 'partially_available'
                  ? 'Partially Loaded'
                  : 'Awaiting File Ingestion'
              }
            />
          )
        }
      />

      {/* Dataset Ingestion Readiness Notice */}
      <div className="mb-8 p-5 rounded-xl border border-[#E1E8E1] bg-white shadow-xs">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isDataAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isDataAvailable ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17211B]">
              Scientific Data Architecture Transparency
            </h3>
            <p className="text-xs text-[#66736A] mt-1.5 leading-relaxed">
              Water Shadow is engineered to run with complete transparency. Under Section 13 of the specification, the application cleanly distinguishes between missing files, ongoing validations, and fully loaded operational datasets. The table below represents the real-time status reported by the FastAPI analytics engine.
            </p>

            {dataStatus?.missing_requirements && dataStatus.missing_requirements.length > 0 && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                <span className="font-semibold text-stone-800 block mb-1">
                  Pending Data File Requirements:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                  {dataStatus.missing_requirements.map((req, idx) => (
                    <li key={idx} className="font-mono text-[11px]">{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading or Error states */}
      {isMetaLoading || isStatusLoading ? (
        <LoadingState message="Connecting to metadata and data-status endpoints..." />
      ) : isMetaError ? (
        <ErrorState
          title="Could Not Retrieve Metadata"
          message={(metaError as any)?.message || 'Failed to connect to backend.'}
          onRetry={() => refetchMeta()}
        />
      ) : (
        <div className="space-y-8">
          {/* Section 13.2 Dataset Cards Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A] mb-4">
              Registered Dataset Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(metadata?.datasets || []).map((ds) => (
                <DatasetStatusCard
                  key={ds.name}
                  name={ds.name}
                  available={ds.available}
                  source={ds.source}
                  description={ds.description}
                  period={ds.period}
                  geographicScope={ds.geographic_coverage}
                  units={ds.units}
                  columns={ds.columns}
                />
              ))}
            </div>
          </div>

          {/* Section 13.2 Dataset Registry Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A] mb-3">
              Dataset Ingestion Specifications
            </h3>
            <DatasetTable datasets={metadata?.datasets || []} />
          </div>

          {/* Section 13.4 Methodology Explanations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A] mb-4">
              Scientific Methodology Principles
            </h3>
            <MethodologyPanel />
          </div>

          {/* API Units Reference */}
          {metadata?.units && (
            <div className="bg-white rounded-xl border border-[#E1E8E1] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#17211B] flex items-center gap-2 mb-3">
                <FileCode className="w-4 h-4 text-[#0F766E]" />
                Standard Units of Measurement
              </h3>
              <p className="text-xs text-[#66736A] mb-4">
                To prevent dimensional confusion, all quantities strictly adhere to these canonical units:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {Object.entries(metadata.units).map(([dim, u]) => (
                  <div key={dim} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="font-semibold capitalize text-slate-700 block text-[11px] mb-0.5">
                      {dim.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-emerald-800 font-bold">{u}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
};
