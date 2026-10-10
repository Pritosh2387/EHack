from typing import List, Dict, Any, Optional
from ml_service.app.schemas.analysis import ExplainRequest, ExplainResponse
from ml_service.app.services.metadata_service import MetadataService

class ExplanationEngineService:
    def __init__(self):
        self.metadata_service = MetadataService()

    def generate_explanation(self, request: ExplainRequest) -> Dict[str, Any]:
        # Generate explanation based on analysis type and parameters
        explanation = {
            "analysis_type": request.analysis_type,
            "parameters": request.parameters,
            "explanation": "",
            "methodology": "",
            "data_sources": [],
            "provenance": {},
            "assumptions": [],
            "limitations": [],
            "calculation_details": {}
        }

        if request.analysis_type == "export_water_footprint":
            explanation["explanation"] = "Calculates the water footprint associated with agricultural exports by multiplying export quantity by water footprint coefficients."
            explanation["methodology"] = "Water Footprint = Export Quantity (tonnes) × Water Footprint Coefficient (m³/tonne)"
            explanation["data_sources"] = [
                "Ministry of Commerce and Industry, TradeStat (export quantities)",
                "Mekonnen and Hoekstra (2011), Water Footprint Network (water coefficients)"
            ]
            explanation["provenance"] = {
                "export_data": "OBSERVED - Actual export statistics from government sources",
                "water_coefficients": "PUBLISHED - Research-derived estimates from scientific literature",
                "calculation": "INFERRED - Mathematical combination of observed and published data"
            }
            explanation["assumptions"] = [
                "Export quantities are accurately reported",
                "Water footprint coefficients are applicable to the exported crops",
                "No significant variation in water use within crop categories",
                "Coefficients represent average conditions"
            ]
            explanation["limitations"] = [
                "Water footprint coefficients may not capture regional variations in water use",
                "Export data may not include all informal or illicit trade",
                "Does not account for changes in agricultural technology or practices over time",
                "Green, blue, and grey water components have different interpretations and should not be simply added without understanding their meaning"
            ]
            if request.parameters.get("crop"):
                explanation["calculation_details"]["crop"] = request.parameters["crop"]
            if request.parameters.get("financial_year"):
                explanation["calculation_details"]["financial_year"] = request.parameters["financial_year"]

        elif request.analysis_type == "crop_shift_scenario":
            explanation["explanation"] = "Compares blue water demand between baseline and alternative crops for a given agricultural area."
            explanation["methodology"] = "Water Demand = Area (hectares) × Yield (tonnes/hectare) × Blue Water Coefficient (m³/tonne)"
            explanation["data_sources"] = [
                "Ministry of Agriculture and Farmers Welfare (crop yields and area)",
                "Mekonnen and Hoekstra (2011), Water Footprint Network (water coefficients)"
            ]
            explanation["provenance"] = {
                "yield_data": "OBSERVED - Agricultural statistics from government sources",
                "area_data": "OBSERVED - Reported cultivated area",
                "water_coefficients": "PUBLISHED - Research-derived estimates",
                "calculation": "INFERRED - Mathematical combination"
            }
            explanation["assumptions"] = [
                "Yields and water coefficients are constant across the area",
                "Area is suitable for both crops (suitability should be verified separately)",
                "No changes in agricultural practices between scenarios",
                "Linear scaling of water demand with area"
            ]
            explanation["limitations"] = [
                "Does not consider climatic variability or extreme weather events",
                "Assumes uniform soil and water conditions across the area",
                "Does not account for irrigation efficiency or water management practices",
                "Agronomic suitability assessment is simplified and requires local validation",
                "Ignores potential market, economic, or social barriers to crop switching"
            ]
            if request.parameters.get("region"):
                explanation["calculation_details"]["region"] = request.parameters["region"]
            if request.parameters.get("area_hectares"):
                explanation["calculation_details"]["area_hectares"] = request.parameters["area_hectares"]

        elif request.analysis_type == "resource_optimization":
            explanation["explanation"] = "Optimizes crop allocation to minimize blue water demand while meeting area constraints."
            explanation["methodology"] = "Linear programming: minimize Σ(area_i × yield_i × water_coeff_i) subject to Σ(area_i) ≤ max_area and area_i ≥ 0"
            explanation["data_sources"] = [
                "Ministry of Agriculture and Farmers Welfare (crop production data)",
                "Mekonnen and Hoekstra (2011), Water Footprint Network (water coefficients)"
            ]
            explanation["provenance"] = {
                "production_data": "OBSERVED - Agricultural statistics",
                "water_coefficients": "PUBLISHED - Research-derived estimates",
                "optimization": "INFERRED - Mathematical optimization result"
            }
            explanation["assumptions"] = [
                "Linear relationship between cultivated area and water demand",
                "Constant yields and water coefficients across all areas",
                "Homogeneous land quality suitable for all considered crops",
                "No minimum or maximum crop-specific area requirements",
                "Continuous land allocation (fractional hectares possible)"
            ]
            explanation["limitations"] = [
                "Linear model may not capture complex ecological or economic interactions",
                "Assumes perfect divisibility of land and instantaneous reallocation",
                "Does not consider crop rotation requirements or soil health impacts",
                "Ignores market demands, prices, subsidies, or farmer preferences",
                "Water coefficients represent averages and may not reflect local conditions or practices"
            ]

        else:
            explanation["explanation"] = f"Analysis of type {request.analysis_type} performed."
            explanation["methodology"] = "Standard analytical methodology applied."
            explanation["data_sources"] = ["Various government and research sources"]
            explanation["provenance"] = {
                "data": "MIXED - Combination of observed and published sources",
                "calculation": "INFERRED - Derived from input data"
            }

        return explanation