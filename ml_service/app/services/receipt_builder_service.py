from typing import Dict, Any, Optional, List
from ml_service.app.schemas.receipts import ReceiptRequest, ReceiptResponse
import uuid
from datetime import datetime

class ReceiptBuilderService:
    def __init__(self):
        self.methodology_version = "0.1.0"

    def build_receipt(self, request: ReceiptRequest) -> ReceiptResponse:
        # Generate a unique receipt ID
        receipt_id = str(uuid.uuid4())

        # Build the receipt based on the analysis type and data
        return ReceiptResponse(
            receipt_id=receipt_id,
            timestamp=datetime.now(),
            analysis_type=request.analysis_type,
            parameters=request.parameters,
            result_data=request.result_data,
            calculation_methodology=self._get_methodology(request.analysis_type),
            data_sources=self._get_data_sources(request.analysis_type),
            provenance=self._get_provenance(request.analysis_type),
            assumptions=self._get_assumptions(request.analysis_type),
            limitations=self._get_limitations(request.analysis_type),
            methodology_version=self.methodology_version,
            generated_at=datetime.now()
        )

    def _get_methodology(self, analysis_type: str) -> str:
        methodologies = {
            "export_water_footprint": "Export quantity (tonnes) × Water footprint coefficient (m³/tonne) = Water footprint (m³)",
            "crop_shift_scenario": "Area (ha) × Yield (tonnes/ha) × Blue water coefficient (m³/tonne) = Blue water demand (m³)",
            "resource_optimization": "Linear programming to minimize total blue water demand subject to area constraints",
            "sensitivity_analysis": "Systematic variation of input parameters to assess impact on model outputs",
            "explanation": "Trace calculation steps and identify data sources, assumptions, and limitations"
        }
        return methodologies.get(analysis_type, "Standard analytical methodology")

    def _get_data_sources(self, analysis_type: str) -> List[str]:
        sources = {
            "export_water_footprint": [
                "Ministry of Commerce and Industry, TradeStat",
                "Mekonnen and Hoekstra (2011), Water Footprint Network"
            ],
            "crop_shift_scenario": [
                "Ministry of Agriculture and Farmers Welfare, Government of India",
                "Mekonnen and Hoekstra (2011), Water Footprint Network"
            ],
            "resource_optimization": [
                "Ministry of Agriculture and Farmers Welfare, Government of India",
                "Mekonnen and Hoekstra (2011), Water Footprint Network"
            ],
            "sensitivity_analysis": [
                "Same as underlying analysis being tested"
            ],
            "explanation": [
                "Data sources of the underlying analysis"
            ]
        }
        return sources.get(analysis_type, ["Various government and research sources"])

    def _get_provenance(self, analysis_type: str) -> Dict[str, str]:
        provenance = {
            "export_water_footprint": {
                "export_data": "OBSERVED",
                "water_coefficients": "PUBLISHED",
                "calculation": "INFERRED"
            },
            "crop_shift_scenario": {
                "area_data": "OBSERVED",
                "yield_data": "OBSERVED",
                "water_coefficients": "PUBLISHED",
                "calculation": "INFERRED"
            },
            "resource_optimization": {
                "production_data": "OBSERVED",
                "water_coefficients": "PUBLISHED",
                "optimization_result": "INFERRED"
            },
            "sensitivity_analysis": {
                "input_parameters": "MIXED",
                "variation_method": "INFERRED",
                "results": "INFERRED"
            },
            "explanation": {
                "source_analysis": "MIXED",
                "explanation_construction": "INFERRED"
            }
        }
        return provenance.get(analysis_type, {
            "data": "MIXED",
            "calculation": "INFERRED"
        })

    def _get_assumptions(self, analysis_type: str) -> List[str]:
        assumptions = {
            "export_water_footprint": [
                "Export quantities are accurately reported in official statistics",
                "Water footprint coefficients are representative of actual water use",
                "No significant variation in water use efficiency within crop categories",
                "Coefficients applicable to the specific geographic origin of exports"
            ],
            "crop_shift_scenario": [
                "Yield and water coefficient values are constant across the area",
                "Land is suitable for cultivation of both baseline and alternative crops",
                "No changes in agricultural practices or technology between scenarios",
                "Linear relationship between area and water demand"
            ],
            "resource_optimization": [
                "Linear relationship between cultivated area and water demand",
                "Constant yields and water coefficients across all land parcels",
                "Homogeneous land quality suitable for all considered crops",
                "No minimum or maximum crop-specific area requirements (continuous variables)",
                "Instantaneous reallocation of land is possible without transition costs"
            ],
            "sensitivity_analysis": [
                "Parameter variations are independent and linear in their effects",
                "Other parameters remain constant when one is varied",
                "The tested range encompasses relevant uncertainty",
                "Relationship between parameter and output is monotonic or well-behaved"
            ],
            "explanation": [
                "Input parameters provided are accurate and complete",
                "Underlying analysis was performed correctly",
                "No hidden assumptions or unreported modifications to the analysis"
            ]
        }
        return assumptions.get(analysis_type, ["Standard analytical assumptions apply"])

    def _get_limitations(self, analysis_type: str) -> List[str]:
        limitations = {
            "export_water_footprint": [
                "Water footprint coefficients may not capture regional variations in agricultural practices",
                "Export data may not include all informal, illicit, or unreported trade flows",
                "Does not account for temporal changes in water use efficiency or agricultural technology",
                "Green, blue, and grey water components have different physical meanings and interpretations",
                "Attributing national exports to specific geographic regions requires additional allocation data"
            ],
            "crop_shift_scenario": [
                "Does not consider climatic variability, extreme weather events, or climate change impacts",
                "Assumes uniform soil, water, and agricultural conditions across the area",
                "Does not account for irrigation efficiency, water management practices, or technological differences",
                "Agronomic suitability assessment is simplified and requires local validation",
                "Ignores market dynamics, prices, subsidies, labor availability, and farmer preferences",
                "Does not consider crop rotation requirements, soil health impacts, or biodiversity effects"
            ],
            "resource_optimization": [
                "Linear optimization model may not capture complex ecological, economic, or social interactions",
                "Assumes perfect divisibility of land and instantaneous reallocation without transition costs",
                "Does not consider crop rotation requirements, fallow periods, or soil regeneration needs",
                "Ignores market demands, price fluctuations, subsidies, tariffs, or trade policies",
                "Water coefficients represent spatial and temporal averages that may not reflect local conditions",
                "Optimization assumes all land is equally suitable for all crops (no suitability constraints)"
            ],
            "sensitivity_analysis": [
                "Assumes linear or monotonic relationships between parameters and outputs",
                "Does not capture parameter interactions or combined effects",
                "Limited to the specified range and step size of variation",
                "May miss non-linear thresholds, tipping points, or discontinuous responses",
                "Does not assign probability distributions to parameter variations (deterministic approach)"
            ],
            "explanation": [
                "Explanation is only as good as the underlying analysis and available data",
                "Does not reveal unknown unknowns or hidden assumptions in the original analysis",
                "Limited to explaining what was actually calculated, not what should have been calculated",
                "May oversimplify complex methodological nuances for brevity",
                "Relies on accurate documentation of data sources, assumptions, and limitations"
            ]
        }
        return limitations.get(analysis_type, ["Standard analytical limitations apply"])