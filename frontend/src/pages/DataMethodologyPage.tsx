import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from '../api/metadata';
import { useDataStatus, isDatasetReady, isDatasetPartial } from '../hooks/useDataStatus';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { DatasetStatusCard } from '../components/feedback/DatasetStatusCard';
import { DatasetTable, type DatasetTableItem } from '../components/tables/DatasetTable';
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
    isError: isStatusError,
  } = useDataStatus();

  const isDataAvailable = isDatasetReady(dataStatus?.overall_status);
  const hasPartialData = isDatasetPartial(dataStatus?.overall_status);

  let headerBadgeStatus = 'unavailable';
  let headerBadgeLabel = 'Awaiting File Ingestion';

  if (isStatusLoading) {
    headerBadgeStatus = 'loading';
    headerBadgeLabel = 'Checking Status...';
  } else if (isStatusError) {
    headerBadgeStatus = 'unavailable';
    headerBadgeLabel = 'Status Unavailable';
  } else if (isDataAvailable) {
    headerBadgeStatus = 'ready';
    headerBadgeLabel = 'Starter Datasets Loaded';
  } else if (hasPartialData) {
    headerBadgeStatus = 'partial';
    headerBadgeLabel = 'Partially Loaded';
  }

  const statusByName = React.useMemo(() => {
    const map = new Map<string, any>();
    dataStatus?.datasets?.forEach((d) => map.set(d.name, d));
    return map;
  }, [dataStatus]);

  const enrichedDatasets = React.useMemo<DatasetTableItem[]>(() => {
    return (metadata?.datasets || []).map((ds) => {
      const statusInfo = statusByName.get(ds.name);
      return {
        ...ds,
        available: statusInfo ? statusInfo.available : ds.available,
        row_count: statusInfo?.row_count,
        errors: statusInfo?.errors,
        coverage_notes: statusInfo?.coverage_notes,
      };
    });
  }, [metadata, statusByName]);

  return (
    <AppShell pageTitle="Data & Methodology">
      <PageHeader
        title="Scientific Data Provenance & Methodology"
        subtitle="Complete transparency into the underlying agricultural datasets, ingestion status, validation pipelines, and hydrological estimation models."
        badge={
          <StatusBadge
            status={headerBadgeStatus}
            label={headerBadgeLabel}
          />
        }
      />

      {/* Dataset Ingestion Readiness Notice */}
      <div className="mb-8 p-5 rounded-xl border border-[#E1E8E1] bg-white shadow-xs">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isDataAvailable
                ? 'bg-emerald-100 text-emerald-800'
                : hasPartialData
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {isDataAvailable ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-700" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17211B]">
              {isDataAvailable
                ? 'Starter Dataset Pack Active & Verified'
                : hasPartialData
                ? 'Partial Datasets Loaded into Analytics Service'
                : 'Scientific Data Architecture Transparency'}
            </h3>
            <p className="text-xs text-[#66736A] mt-1.5 leading-relaxed">
              {isDataAvailable
                ? 'The FastAPI analytics engine has discovered, validated, and loaded all 4 supplied starter datasets into memory. Real records for agricultural exports (APEDA 2024-25), Mekonnen & Hoekstra (2011) water footprint coefficients, DES state-level crop production, and CGWB Punjab assessment units are operational.'
                : 'Water Shadow is engineered to run with complete transparency. Under Section 13 of the specification, the application cleanly distinguishes between missing files, ongoing validations, and fully loaded operational datasets. The table below represents the real-time status reported by the FastAPI analytics engine.'}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 italic">
              Limited Geographic & Temporal Coverage: The current starter pack includes verified official rows for major crops and regions (e.g. Punjab groundwater assessment subset), not a complete nationwide census.
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
              {enrichedDatasets.map((ds) => (
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
                  rowCount={ds.row_count}
                  errors={ds.errors}
                  coverageNotes={ds.coverage_notes}
                />
              ))}
            </div>
          </div>

          {/* Section 13.2 Dataset Registry Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66736A] mb-3">
              Dataset Ingestion Specifications
            </h3>
            <DatasetTable datasets={enrichedDatasets} />
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
