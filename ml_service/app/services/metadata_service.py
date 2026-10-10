from ml_service.app.schemas.metadata import MetadataResponse, DatasetInfo
import os

class MetadataService:
    def __init__(self):
        # Check for actual data files
        gw_data_available = os.path.exists("ml_service/data/gwra_2025.pdf")
        wf_data_available = os.path.exists("ml_service/data/water_footprint_article.html")

        self.datasets = [
            DatasetInfo(
                name="agricultural_exports",
                description="India's agricultural export statistics",
                source="Ministry of Commerce and Industry, TradeStat",
                period="2018-2023",
                geographic_coverage="National (India)",
                units={"quantity": "tonnes", "value": "USD thousands"},
                columns=["crop", "financial_year", "quantity", "value", "destination_country"],
                available=False  # Will be True when actual data is loaded
            ),
            DatasetInfo(
                name="crop_water_footprint",
                description="Crop water footprint coefficients (green, blue, grey)",
                source="Mekonnen and Hoekstra (2011), Water Footprint Network",
                period="Various",
                geographic_coverage="Global (with India-specific where available)",
                units={"green": "m³/tonne", "blue": "m³/tonne", "grey": "m³/tonne"},
                columns=["crop", "green_water", "blue_water", "grey_water", "source", "period"],
                available=wf_data_available  # Article available, need to extract data
            ),
            DatasetInfo(
                name="crop_production",
                description="Regional crop production statistics",
                source="Ministry of Agriculture and Farmers Welfare, Government of India",
                period="2018-2023",
                geographic_coverage="State-level (India)",
                units={"area": "hectares", "production": "tonnes", "yield": "tonnes/hectare"},
                columns=["state", "district", "crop", "year", "area", "production", "yield"],
                available=False  # Will be True when actual data is loaded
            ),
            DatasetInfo(
                name="groundwater_assessment",
                description="Groundwater assessment units and classifications",
                source="Central Ground Water Board (CGWB), Government of India",
                period="2020-2023",
                geographic_coverage="Assessment units (India)",
                units={"assessment_unit": "ID", "category": "classification"},
                columns=["assessment_unit_id", "state", "district", "category", "year"],
                available=gw_data_available  # GWRA report available, need to extract data
            )
        ]

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
        return MetadataResponse(
            version="0.1.0",
            description="Water Shadow Analytics Service - Agricultural Water Footprint Analysis",
            datasets=self.datasets,
            supported_crops=self.supported_crops,
            supported_regions=self.supported_regions,
            supported_analysis_types=self.supported_analysis_types,
            units=self.units,
            methodology_info=self.methodology_info
        )