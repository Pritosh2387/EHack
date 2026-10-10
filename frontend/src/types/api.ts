/**
 * Water Shadow TypeScript API Contracts & Domain Models
 * Derived from the FastAPI backend OpenAPI specification
 */

export interface HealthResponse {
  status: string;
  version: string;
  service: string;
}

export interface DatasetInfo {
  name: string;
  description: string;
  source: string;
  period: string;
  geographic_coverage: string;
  units: Record<string, string>;
  columns: string[];
  available: boolean;
}

export interface MetadataResponse {
  version: string;
  description: string;
  datasets: DatasetInfo[];
  supported_crops: string[];
  supported_regions: string[];
  supported_analysis_types: string[];
  units: Record<string, string>;
  methodology_info: Record<string, any>;
}

export interface DataStatusDataset {
  name: string;
  available: boolean;
  description: string;
  source: string;
}

export interface DataStatusResponse {
  overall_status: 'available' | 'partially_available' | 'unavailable';
  datasets: DataStatusDataset[];
  missing_requirements: string[];
  unsupported_calculations: string[];
  join_coverage: Record<string, any>;
  last_updated: string;
}

export interface ExportFootprintResult {
  crop: string;
  financial_year: string;
  export_quantity: number;
  export_quantity_unit: string;
  green_water_coefficient?: number | null;
  blue_water_coefficient?: number | null;
  grey_water_coefficient?: number | null;
  coefficient_unit: string;
  estimated_green_water?: number | null;
  estimated_blue_water?: number | null;
  estimated_grey_water?: number | null;
  total_water_footprint?: number | null;
  footprint_unit: string;
  calculation_methodology: string;
  data_sources: string[];
  provenance: Record<string, string>;
  limitations: string[];
  warning?: string | null;
}

export interface ExportLedgerResponse {
  results: ExportFootprintResult[];
  count: number;
  filters_applied: {
    crop?: string;
    financial_year?: string | null;
    water_component?: string;
    [key: string]: any;
  };
  generated_at: string;
}

export interface CropProductionResult {
  state: string;
  district?: string | null;
  crop: string;
  year: string;
  area?: number | null;
  area_unit: string;
  production?: number | null;
  production_unit: string;
  yield_?: number | null;
  yield?: number | null; // Handle potential alias mapping
  yield_unit: string;
  data_source: string;
  provenance: Record<string, string>;
  limitations: string[];
}

export interface CropProductionResponse {
  results: CropProductionResult[];
  count: number;
  filters_applied: Record<string, any>;
  generated_at: string;
}

export interface GroundwaterAssessmentUnit {
  assessment_unit_id: string;
  state: string;
  district: string;
  category: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited' | 'Saline' | string;
  year: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GroundwaterSummary {
  total_units: number;
  safe: number;
  semi_critical: number;
  critical: number;
  over_exploited: number;
  saline: number;
}

export interface GroundwaterStressResponse {
  assessment_units: GroundwaterAssessmentUnit[];
  summary: GroundwaterSummary;
  data_source: string;
  provenance: Record<string, string>;
  limitations: string[];
  filters_applied: Record<string, any>;
  last_updated: string;
  data_availability: {
    real_data_parsed_and_usable: boolean;
    validation_errors: string[];
  };
}

export interface RegionsOverviewResponse {
  crop_production: CropProductionResponse;
  groundwater_assessment: GroundwaterStressResponse;
  region: string | null;
  year: string | null;
  generated_at: string;
}

export interface CropShiftRequest {
  region: string;
  baseline_crop: string;
  alternative_crop: string;
  area_hectares: number;
  reference_year?: string;
  include_suitability?: boolean;
}

export interface CropShiftResult {
  region: string;
  baseline_crop: string;
  alternative_crop: string;
  area_hectares: number;
  reference_year?: string | null;
  baseline_yield?: number | null;
  alternative_yield?: number | null;
  yield_unit: string;
  baseline_blue_water_coefficient?: number | null;
  alternative_blue_water_coefficient?: number | null;
  coefficient_unit: string;
  baseline_demand?: number | null;
  alternative_demand?: number | null;
  absolute_difference?: number | null;
  percentage_difference?: number | null;
  difference_unit: string;
  calculation_methodology: string;
  data_sources: string[];
  provenance: Record<string, string>;
  agronomic_suitability: Record<string, any>;
  assumptions: string[];
  limitations: string[];
}

export interface CropShiftResponse {
  result: CropShiftResult;
  generated_at: string;
}

export interface OptimizationRequest {
  region: string;
  objective?: string;
  time_period?: string;
  constraints?: Record<string, any>;
}

export interface OptimizationResult {
  region: string;
  objective: string;
  time_period: string;
  baseline_allocation: Record<string, number>;
  optimized_allocation: Record<string, number>;
  baseline_blue_water_demand?: number | null;
  optimized_blue_water_demand?: number | null;
  water_demand_difference?: number | null;
  water_demand_difference_percent?: number | null;
  water_demand_difference_percentage?: number | null;
  baseline_production?: number | null;
  optimized_production?: number | null;
  production_difference?: number | null;
  production_difference_percent?: number | null;
  production_difference_percentage?: number | null;
  solver_used: string;
  solver_status: string;
  feasibility_status: string;
  calculation_methodology: string;
  data_sources: string[];
  provenance: Record<string, string>;
  assumptions: string[];
  limitations: string[];
}

export interface OptimizationResponse {
  result: OptimizationResult;
  generated_at: string;
}

export interface SensitivityRequest {
  analysis_type: string;
  parameter_to_vary: string;
  baseline_value: number;
  variation_percent?: number;
  steps?: number;
}

export interface SensitivityStep {
  step: number;
  parameter_value: number;
  parameter_change_percent: number;
  notes?: string;
  [key: string]: any;
}

export interface SensitivityResult {
  parameter_name: string;
  baseline_value: number;
  variation_percent: number;
  results: SensitivityStep[];
  analysis_type: string;
  methodology: string;
}

export interface SensitivityResponse {
  result: SensitivityResult;
  generated_at: string;
}

export interface ExplainRequest {
  analysis_type: string;
  analysis_id?: string;
  parameters: Record<string, any>;
}

export interface ExplainResponse {
  explanation: {
    analysis_type: string;
    parameters: Record<string, any>;
    explanation: string;
    methodology: string;
    data_sources: string[];
    provenance: Record<string, string>;
    assumptions: string[];
    limitations: string[];
    calculation_details: Record<string, any>;
  };
  generated_at: string;
}

export interface ReceiptRequest {
  analysis_type: string;
  parameters: Record<string, any>;
  result_data: Record<string, any>;
}

export interface ReceiptResponse {
  receipt_id: string;
  timestamp: string;
  analysis_type: string;
  parameters: Record<string, any>;
  result_data: Record<string, any>;
  calculation_methodology: string;
  data_sources: string[];
  provenance: Record<string, string>;
  assumptions: string[];
  limitations: string[];
  methodology_version: string;
  generated_at: string;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string | any;
  isNetworkError?: boolean;
}
