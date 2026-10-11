from ml_service.app.schemas.metadata import MetadataResponse, DatasetInfo
from ml_service.app.data_loader import data_loader
import os

class MetadataService:
    def __init__(self, loader=None):
        self.loader = loader or data_loader

        self.supported_crops = [
            "rice", "wheat", "sugarcane", "cotton", "soybean",
            "groundnut", "sunflower", "sesame", "mustard", "maize"
        ]

        self.supported_regions = [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
            "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
            "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
            "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
            "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ]

        self.supported_analysis_types = [
            "export_water_footprint",
            "regional_crop_production",
            "groundwater_stress",
            "crop_shift_scenario",
            "resource_optimization",
            "sensitivity_analysis"
        ]

        self.units = {
            "area": "hectares",
            "production": "tonnes",
            "yield": "tonnes/hectare",
            "water_volume": "cubic metres",
            "water_intensity": "cubic metres/tonne",
            "export_value": "USD thousands",
            "export_quantity": "tonnes"
        }

        self.methodology_info = {
            "water_footprint_calculation": "Based on Mekonnen and Hoekstra (2011) methodology",
            "export_allocation": "National exports analyzed separately from regional production",
            "groundwater_classification": "Official CGWB classifications preserved",
            "scenario_modeling": "Deterministic comparison of baseline vs alternative crops"
        }

    def get_metadata(self) -> MetadataResponse:
        statuses = self.loader.get_all_datasets_status()

        datasets = [
            DatasetInfo(
                name="agricultural_exports",
                description="India's agricultural export statistics",
                source="Ministry of Commerce and Industry, TradeStat / APEDA Annual Administrative Report 2024-25",
                period=statuses.get("agricultural_exports", {}).get("period", "2024-25"),
                geographic_coverage=statuses.get("agricultural_exports", {}).get("geographic_coverage", "National (India - APEDA product aggregates)"),
                units={"quantity": "tonnes", "value": "USD thousands"},
                columns=[
                    "hs_code", "commodity_description", "original_quantity",
                    "original_quantity_unit", "normalized_quantity_tonnes",
                    "financial_year", "export_value", "currency", "source_reference"
                ],
                available=statuses.get("agricultural_exports", {}).get("available", False)
            ),
            DatasetInfo(
                name="crop_water_footprint",
                description="Crop water footprint coefficients (green, blue, grey)",
                source="Mekonnen and Hoekstra (2011), Water Footprint Network",
                period=statuses.get("crop_water_footprint", {}).get("period", "1996-2005"),
                geographic_coverage=statuses.get("crop_water_footprint", {}).get("geographic_coverage", "Global estimate"),
                units={"green": "m³/tonne", "blue": "m³/tonne", "grey": "m³/tonne"},
                columns=[
                    "crop_or_product", "green_water", "blue_water", "grey_water",
                    "coefficient_unit", "geographic_scope", "reference_period",
                    "source_publication", "methodology"
                ],
                available=statuses.get("crop_water_footprint", {}).get("available", False)
            ),
            DatasetInfo(
                name="crop_production",
                description="Regional crop production statistics",
                source="Ministry of Agriculture and Farmers Welfare, DES Agricultural Statistics at a Glance 2024-25",
                period=statuses.get("crop_production", {}).get("period", "2023-24 to 2024-25"),
                geographic_coverage=statuses.get("crop_production", {}).get("geographic_coverage", "State-level (India - 10 major producing states)"),
                units={"area": "hectares", "production": "tonnes", "yield": "tonnes/hectare"},
                columns=["state", "district", "crop", "year", "area", "production", "yield"],
                available=statuses.get("crop_production", {}).get("available", False)
            ),
            DatasetInfo(
                name="groundwater_assessment",
                description="Groundwater assessment units and classifications",
                source="Central Ground Water Board (CGWB), Government of India",
                period=statuses.get("groundwater_assessment", {}).get("period", "2022"),
                geographic_coverage=statuses.get("groundwater_assessment", {}).get("geographic_coverage", "Punjab (Ludhiana district - 5 assessment units)"),
                units={"assessment_unit": "ID", "category": "classification"},
                columns=["assessment_unit_id", "state", "district", "category", "year", "latitude", "longitude"],
                available=statuses.get("groundwater_assessment", {}).get("available", False)
            )
        ]

        return MetadataResponse(
            version="0.1.0",
            description="Water Shadow Analytics Service - Agricultural Water Footprint Analysis",
            datasets=datasets,
            supported_crops=self.supported_crops,
            supported_regions=self.supported_regions,
            supported_analysis_types=self.supported_analysis_types,
            units=self.units,
            methodology_info=self.methodology_info
        )