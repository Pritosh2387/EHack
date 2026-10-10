from typing import List, Dict, Any, Optional
from ml_service.app.schemas.scenarios import CropShiftRequest, CropShiftResult
from ml_service.app.data_loader import data_loader
import pandas as pd

class CropShiftSimulatorService:
    def __init__(self):
        df_prod, suc_prod, _ = data_loader.load_crop_production()
        self.production_data = df_prod if suc_prod else pd.DataFrame()
        self.is_real_prod = suc_prod
        
        df_wf, suc_wf, _ = data_loader.load_crop_water_footprint()
        self.water_footprint_data = df_wf if suc_wf else pd.DataFrame()
        self.is_real_wf = suc_wf

    def simulate_crop_shift(self, request: CropShiftRequest) -> CropShiftResult:
        if not self.is_real_prod or not self.is_real_wf:
            raise ValueError("Real crop production dataset or crop water footprint dataset is unavailable or failed validation.")

        supported_crops = data_loader.supported_crops
        if request.baseline_crop.lower() not in supported_crops:
            raise ValueError(f"Unsupported baseline crop: {request.baseline_crop}")
        if request.alternative_crop.lower() not in supported_crops:
            raise ValueError(f"Unsupported alternative crop: {request.alternative_crop}")

        baseline_yield = self._get_real_yield(request.baseline_crop, request.region, request.reference_year)
        alternative_yield = self._get_real_yield(request.alternative_crop, request.region, request.reference_year)

        if baseline_yield is None:
            raise ValueError(f"Yield data not available for baseline crop: {request.baseline_crop} in region: {request.region}")
        if alternative_yield is None:
            raise ValueError(f"Yield data not available for alternative crop: {request.alternative_crop} in region: {request.region}")

        baseline_blue_coeff = self._get_real_blue_water_coefficient(request.baseline_crop)
        alternative_blue_coeff = self._get_real_blue_water_coefficient(request.alternative_crop)

        if baseline_blue_coeff is None:
            raise ValueError(f"Water footprint data not available for baseline crop: {request.baseline_crop}")
        if alternative_blue_coeff is None:
            raise ValueError(f"Water footprint data not available for alternative crop: {request.alternative_crop}")

        # Calculate water demand
        baseline_demand = request.area_hectares * baseline_yield * baseline_blue_coeff
        alternative_demand = request.area_hectares * alternative_yield * alternative_blue_coeff
        absolute_difference = alternative_demand - baseline_demand
        percentage_difference = (absolute_difference / baseline_demand * 100) if baseline_demand != 0 else 0

        # Determine agronomic suitability (simplified)
        agronomic_suitability = {
            "baseline_crop": self._get_crop_suitability(request.baseline_crop, request.region),
            "alternative_crop": self._get_crop_suitability(request.alternative_crop, request.region),
            "assessment_based_on": "General climate and soil suitability (simplified)"
        }

        return CropShiftResult(
            region=request.region,
            baseline_crop=request.baseline_crop,
            alternative_crop=request.alternative_crop,
            area_hectares=request.area_hectares,
            reference_year=request.reference_year,
            baseline_yield=baseline_yield,
            alternative_yield=alternative_yield,
            baseline_blue_water_coefficient=baseline_blue_coeff,
            alternative_blue_water_coefficient=alternative_blue_coeff,
            baseline_demand=baseline_demand,
            alternative_demand=alternative_demand,
            absolute_difference=absolute_difference,
            percentage_difference=percentage_difference,
            calculation_methodology="Area × Yield × Blue Water Footprint Coefficient",
            data_sources=[
                "Ministry of Agriculture and Farmers Welfare, Government of India",
                "Mekonnen and Hoekstra (2011), Water Footprint Network"
            ],
            provenance={
                "yield_data": "OBSERVED",
                "water_coefficients": "PUBLISHED",
                "calculation": "INFERRED"
            },
            agronomic_suitability=agronomic_suitability,
            assumptions=[
                "Yield remains constant across the specified area",
                "Water footprint coefficients are applicable to the region",
                "No significant changes in agricultural practices",
                "Area is suitable for both crops (suitability assessed separately)"
            ],
            limitations=[
                "Does not account for climatic variability within the region",
                "Assumes uniform yield and water coefficients across the area",
                "Does not consider irrigation efficiency or water management practices",
                "Agronomic suitability is simplified and should be validated with local expertise"
            ]
        )

    def _get_real_yield(self, crop: str, region: Optional[str], year: Optional[str]) -> Optional[float]:
        df = self.production_data[self.production_data['crop'] == crop.lower()]
        if region:
            df_region = df[df['state'].str.lower() == region.lower()]
            if not df_region.empty:
                df = df_region
        if year:
            df_year = df[df['year'].astype(str) == str(year)]
            if not df_year.empty:
                df = df_year
        if not df.empty:
            return float(df['yield'].mean())
        return None

    def _get_real_blue_water_coefficient(self, crop: str) -> Optional[float]:
        df = self.water_footprint_data[self.water_footprint_data['crop_or_product'] == crop.lower()]
        if not df.empty:
            return float(df['blue_water'].mean())
        return None

    def _get_crop_suitability(self, crop: str, region: str) -> str:
        suitability_map = {
            'rice': ['West Bengal', 'Punjab', 'Haryana', 'Andhra Pradesh', 'Tamil Nadu'],
            'wheat': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'],
            'sugarcane': ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh'],
            'cotton': ['Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Haryana'],
            'soybean': ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Telangana']
        }
        suitable_regions = suitability_map.get(crop.lower(), [])
        if region and any(r.lower() == region.lower() for r in suitable_regions):
            return "Suitable"
        elif region:
            return "Moderately Suitable (limited data)"
        else:
            return "Unknown (region not specified for suitability check)"