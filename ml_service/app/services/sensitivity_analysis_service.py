from typing import List, Dict, Any, Optional
from ml_service.app.schemas.analysis import SensitivityRequest, SensitivityResult
from ml_service.app.services.crop_shift_simulator_service import CropShiftSimulatorService
from ml_service.app.services.export_analytics_service import ExportAnalyticsService
import pandas as pd

class SensitivityAnalysisService:
    def __init__(self):
        self.crop_shift_service = CropShiftSimulatorService()
        self.export_analytics_service = ExportAnalyticsService()

    def run_sensitivity_analysis(self, request: SensitivityRequest) -> SensitivityResult:
        # This is a simplified sensitivity analysis implementation
        # In production, this would be more sophisticated and tied to specific analyses

        results = []

        if request.analysis_type == "crop_shift" and request.parameter_to_vary == "yield":
            # Sensitivity of crop shift results to yield changes
            baseline_yield = request.baseline_value
            variation = request.variation_percent / 100.0

            for i in range(-request.steps, request.steps + 1):
                factor = 1.0 + (i * variation / request.steps)
                varied_yield = baseline_yield * factor

                # Create a mock request to see how yield affects results
                # In reality, we'd modify the actual calculation
                results.append({
                    "step": i,
                    "parameter_value": varied_yield,
                    "parameter_change_percent": i * (variation / request.steps) * 100,
                    "notes": f"Yield varied by {i * (variation / request.steps) * 100:.1f}%"
                })

        elif request.analysis_type == "export_water_footprint" and request.parameter_to_vary == "water_coefficient":
            # Sensitivity of export water footprint to water coefficient changes
            baseline_coeff = request.baseline_value
            variation = request.variation_percent / 100.0

            for i in range(-request.steps, request.steps + 1):
                factor = 1.0 + (i * variation / request.steps)
                varied_coeff = baseline_coeff * factor

                results.append({
                    "step": i,
                    "parameter_value": varied_coeff,
                    "parameter_change_percent": i * (variation / request.steps) * 100,
                    "notes": f"Water coefficient varied by {i * (variation / request.steps) * 100:.1f}%"
                })
        else:
            # Generic sensitivity analysis
            baseline = request.baseline_value
            variation = request.variation_percent / 100.0

            for i in range(-request.steps, request.steps + 1):
                factor = 1.0 + (i * variation / request.steps)
                varied_value = baseline * factor

                results.append({
                    "step": i,
                    "parameter_value": varied_value,
                    "parameter_change_percent": i * (variation / request.steps) * 100,
                    "notes": f"{request.parameter_to_vary} varied by {i * (variation / request.steps) * 100:.1f}%"
                })

        return SensitivityResult(
            parameter_name=request.parameter_to_vary,
            baseline_value=request.baseline_value,
            variation_percent=request.variation_percent,
            results=results,
            analysis_type=request.analysis_type,
            methodology=f"Varied {request.parameter_to_vary} by ±{request.variation_percent}% in {request.steps} steps"
        )