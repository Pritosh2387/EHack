import os
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import warnings

def resolve_data_dir(data_dir: Optional[str] = None) -> str:
    if data_dir:
        abs_p = os.path.abspath(data_dir)
        if os.path.exists(abs_p):
            return abs_p
        return data_dir

    env_dir = os.getenv("DATA_PATH")
    if env_dir and os.path.exists(os.path.abspath(env_dir)):
        return os.path.abspath(env_dir)

    module_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    if os.path.exists(module_data_dir):
        return module_data_dir

    if os.path.exists("ml_service/data"):
        return os.path.abspath("ml_service/data")

    return module_data_dir


class DataLoader:
    """Handles loading and validation of datasets for Water Shadow services."""

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = resolve_data_dir(data_dir)
        self.supported_crops = [
            "rice", "wheat", "sugarcane", "cotton", "soybean",
            "groundnut", "sunflower", "sesame", "mustard", "maize"
        ]
        self.supported_states = [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
            "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
            "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
            "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
            "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ]
        self.groundwater_categories = ["Safe", "Semi-Critical", "Critical", "Over-Exploited", "Saline"]

    def _read_file(self, base_name: str) -> Tuple[Optional[pd.DataFrame], List[str]]:
        csv_path = os.path.join(self.data_dir, f"{base_name}.csv")
        excel_path = os.path.join(self.data_dir, f"{base_name}.xlsx")
        
        if os.path.exists(csv_path):
            try:
                df = pd.read_csv(csv_path)
                return df, []
            except Exception as e:
                return None, [f"Error reading CSV {base_name}.csv: {str(e)}"]
        elif os.path.exists(excel_path):
            try:
                df = pd.read_excel(excel_path)
                return df, []
            except Exception as e:
                return None, [f"Error reading Excel {base_name}.xlsx: {str(e)}"]
        return None, [f"File not found: {base_name}.csv or {base_name}.xlsx at {os.path.abspath(self.data_dir)}"]

    def load_agricultural_exports(self) -> Tuple[pd.DataFrame, bool, List[str]]:
        df, errors = self._read_file("agricultural_exports")
        if df is None:
            return pd.DataFrame(), False, errors

        required_columns = [
            "hs_code", "commodity_description", "original_quantity", 
            "original_quantity_unit", "normalized_quantity_tonnes", 
            "financial_year", "export_value", "currency", "source_reference"
        ]
        
        missing = [c for c in required_columns if c not in df.columns]
        if missing:
            return pd.DataFrame(), False, [f"Missing columns: {missing}"]

        if df.empty:
            return pd.DataFrame(), False, ["Dataset is empty (0 rows)"]

        if "financial_year" in df.columns:
            invalid_years = df[~df["financial_year"].astype(str).str.match(r'^\d{4}-\d{2}$')]
            if not invalid_years.empty:
                errors.append(f"Invalid financial_year format: {invalid_years['financial_year'].head().tolist()}")
        
        for col in ["original_quantity", "normalized_quantity_tonnes", "export_value"]:
            if col in df.columns and (pd.to_numeric(df[col], errors='coerce') < 0).any():
                errors.append(f"Column '{col}' has negative values")
                
        if errors:
            return pd.DataFrame(), False, errors
        return df, True, []

    def load_crop_water_footprint(self) -> Tuple[pd.DataFrame, bool, List[str]]:
        df, errors = self._read_file("crop_water_footprint")
        if df is None:
            return pd.DataFrame(), False, errors

        required_columns = [
            "crop_or_product", "green_water", "blue_water", "grey_water", 
            "coefficient_unit", "geographic_scope", "reference_period", 
            "source_publication", "methodology"
        ]
        missing = [c for c in required_columns if c not in df.columns]
        if missing:
            return pd.DataFrame(), False, [f"Missing columns: {missing}"]

        if df.empty:
            return pd.DataFrame(), False, ["Dataset is empty (0 rows)"]

        for col in ["green_water", "blue_water", "grey_water"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                if (df[col] < 0).any():
                    errors.append(f"Column '{col}' has negative values")
                    
        df['crop_or_product'] = df['crop_or_product'].astype(str).str.lower()
        if errors:
            return pd.DataFrame(), False, errors
        return df, True, []

    def load_crop_production(self) -> Tuple[pd.DataFrame, bool, List[str]]:
        df, errors = self._read_file("crop_production")
        if df is None:
            return pd.DataFrame(), False, errors

        required_columns = ["state", "district", "crop", "year", "area", "production", "yield"]
        missing = [c for c in required_columns if c not in df.columns and c != "district"]
        if missing:
            return pd.DataFrame(), False, [f"Missing columns: {missing}"]

        if "district" not in df.columns:
            df["district"] = None
        else:
            df["district"] = df["district"].where(pd.notna(df["district"]), None)

        if df.empty:
            return pd.DataFrame(), False, ["Dataset is empty (0 rows)"]

        if "year" in df.columns:
            year_str = df["year"].astype(str)
            invalid_years = year_str[~year_str.str.match(r'^(\d{4}-\d{2}|\d{4})$')]
            if not invalid_years.empty:
                errors.append(f"Invalid year format: {invalid_years.head().tolist()}")
                
        for col in ["area", "production", "yield"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                if (df[col] < 0).any():
                    errors.append(f"Column '{col}' has negative values")
                    
        if "state" in df.columns:
            invalid_states = df[~df["state"].isin(self.supported_states)]["state"].unique()
            if len(invalid_states) > 0:
                errors.append(f"Unsupported state values: {invalid_states[:5].tolist()}")
                
        if "crop" in df.columns:
            invalid_crops = df[~df["crop"].str.lower().isin(self.supported_crops)]["crop"].unique()
            if len(invalid_crops) > 0:
                errors.append(f"Unsupported crop values: {invalid_crops[:5].tolist()}")
                
        df['crop'] = df['crop'].str.lower()
        if errors:
            return pd.DataFrame(), False, errors
        return df, True, []

    def load_groundwater_assessment(self) -> Tuple[pd.DataFrame, bool, List[str]]:
        df, errors = self._read_file("groundwater_assessment")
        if df is None:
            pdf_path = os.path.join(self.data_dir, "gwra_2025.pdf")
            if os.path.exists(pdf_path):
                return pd.DataFrame(), False, ["PDF found but not automatically parsable. Please provide groundwater_assessment.csv"]
            return pd.DataFrame(), False, errors

        required_columns = ["assessment_unit_id", "state", "district", "category", "year"]
        missing = [c for c in required_columns if c not in df.columns]
        if missing:
            return pd.DataFrame(), False, [f"Missing columns: {missing}"]

        if "latitude" not in df.columns:
            df["latitude"] = None
        else:
            df["latitude"] = df["latitude"].where(pd.notna(df["latitude"]), None)

        if "longitude" not in df.columns:
            df["longitude"] = None
        else:
            df["longitude"] = df["longitude"].where(pd.notna(df["longitude"]), None)

        if df.empty:
            return pd.DataFrame(), False, ["Dataset is empty (0 rows)"]

        if "category" in df.columns:
            invalid_categories = df[~df["category"].isin(self.groundwater_categories)]["category"].unique()
            if len(invalid_categories) > 0:
                errors.append(f"Invalid groundwater categories: {invalid_categories.tolist()}")

        if "year" in df.columns:
            df["year"] = pd.to_numeric(df["year"], errors='coerce')
            invalid_years = df[(df["year"] < 1900) | (df["year"] > 2050)]
            if not invalid_years.empty:
                errors.append(f"Year values outside reasonable range (1900-2050)")
                
        if "state" in df.columns:
            invalid_states = df[~df["state"].isin(self.supported_states)]["state"].unique()
            if len(invalid_states) > 0:
                errors.append(f"Unsupported state values: {invalid_states[:5].tolist()}")
                
        if errors:
            return pd.DataFrame(), False, errors
        return df, True, []

    def get_all_datasets_status(self) -> Dict[str, Dict[str, Any]]:
        metadata_map = {
            "agricultural_exports": {
                "description": "India's agricultural export statistics",
                "source": "Ministry of Commerce and Industry, TradeStat / APEDA Annual Administrative Report 2024-25",
                "period": "2024-25",
                "geographic_coverage": "National (India - APEDA product aggregates)",
                "coverage_notes": "Starter pack subset (3 commodity categories: Non-Basmati Rice, Basmati Rice, Wheat for FY 2024-25; product aggregates, not destination-level census).",
                "loader": self.load_agricultural_exports,
            },
            "crop_water_footprint": {
                "description": "Crop water footprint coefficients (green, blue, grey)",
                "source": "Mekonnen and Hoekstra (2011), Water Footprint Network",
                "period": "1996-2005",
                "geographic_coverage": "Global estimate",
                "coverage_notes": "Global average estimates (Table 3); rice sub-categories map to paddy proxy. Indicative baseline coefficients.",
                "loader": self.load_crop_water_footprint,
            },
            "crop_production": {
                "description": "Regional crop production statistics",
                "source": "Ministry of Agriculture and Farmers Welfare, DES Agricultural Statistics at a Glance 2024-25",
                "period": "2023-24 to 2024-25",
                "geographic_coverage": "State-level (India - 10 major producing states)",
                "coverage_notes": "Subset of major producing states for rice and wheat (state-level totals; district omitted in source tables; 40 rows).",
                "loader": self.load_crop_production,
            },
            "groundwater_assessment": {
                "description": "Groundwater assessment units and classifications",
                "source": "Central Ground Water Board (CGWB), Government of India",
                "period": "2022",
                "geographic_coverage": "Punjab (Ludhiana district - 5 assessment units)",
                "coverage_notes": "Limited sample of 5 Over-Exploited units in Ludhiana, Punjab (2022 report); not nationwide coverage.",
                "loader": self.load_groundwater_assessment,
            }
        }

        results = {}
        for name, meta in metadata_map.items():
            df, success, errors = meta["loader"]()
            results[name] = {
                "name": name,
                "description": meta["description"],
                "source": meta["source"],
                "period": meta["period"],
                "geographic_coverage": meta["geographic_coverage"],
                "coverage_notes": meta["coverage_notes"],
                "available": bool(success),
                "row_count": len(df) if success else 0,
                "errors": errors,
                "columns": df.columns.tolist() if not df.empty else []
            }
        return results


    # sample dataset getters ...
    def get_sample_agricultural_exports(self) -> pd.DataFrame:
        data = {
            'crop': ['rice', 'wheat', 'sugarcane', 'cotton', 'soybean', 'rice', 'wheat'],
            'financial_year': ['2020-21', '2020-21', '2020-21', '2020-21', '2020-21', '2021-22', '2021-22'],
            'quantity': [5000.0, 3000.0, 2000.0, 1500.0, 800.0, 5500.0, 3200.0],
            'value': [1200000, 900000, 600000, 450000, 240000, 1320000, 960000],
            'destination_country': ['USA', 'Bangladesh', 'Malaysia', 'China', 'Indonesia', 'USA', 'Bangladesh']
        }
        return pd.DataFrame(data)

    def get_sample_crop_water_footprint(self) -> pd.DataFrame:
        data = {
            'crop': ['rice', 'wheat', 'sugarcane', 'cotton', 'soybean'],
            'green_water': [1500.0, 1200.0, 1800.0, 2200.0, 1400.0],
            'blue_water': [800.0, 600.0, 900.0, 1400.0, 700.0],
            'grey_water': [300.0, 200.0, 400.0, 500.0, 250.0],
            'source': ['Mekonnen & Hoekstra (2011)'] * 5,
            'period': ['1996-2005'] * 5
        }
        return pd.DataFrame(data)

    def get_sample_crop_production(self) -> pd.DataFrame:
        data = {
            'state': ['Punjab', 'Punjab', 'Haryana', 'Haryana', 'Uttar Pradesh', 'Uttar Pradesh',
                     'Madhya Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Maharashtra'],
            'district': ['Ludhiana', 'Fazilka', 'Karnal', 'Sirsa', 'Meerut', 'Agra',
                        'Indore', 'Bhopal', 'Pune', 'Nashik'],
            'crop': ['rice', 'wheat', 'rice', 'wheat', 'wheat', 'sugarcane',
                     'soybean', 'cotton', 'sugarcane', 'cotton'],
            'year': ['2020-21', '2020-21', '2020-21', '2020-21', '2020-21', '2020-21',
                     '2020-21', '2020-21', '2020-21', '2020-21'],
            'area': [150000.0, 200000.0, 120000.0, 180000.0, 300000.0, 80000.0,
                     100000.0, 150000.0, 60000.0, 90000.0],
            'production': [450000.0, 800000.0, 360000.0, 720000.0, 350000.0, 4800000.0,
                           350000.0, 450000.0, 3600000.0, 270000.0],
            'yield': [3.0, 4.0, 3.0, 4.0, 3.5, 60.0,
                      3.5, 3.0, 60.0, 3.0]
        }
        return pd.DataFrame(data)

    def get_sample_groundwater_assessment(self) -> pd.DataFrame:
        data = {
            'assessment_unit_id': ['AU001', 'AU002', 'AU003', 'AU004', 'AU005', 'AU006'],
            'state': ['Punjab', 'Punjab', 'Haryana', 'Haryana', 'Rajasthan', 'Rajasthan'],
            'district': ['Ludhiana', 'Fazilka', 'Karnal', 'Sirsa', 'Jodhpur', 'Barmer'],
            'category': ['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited', 'Safe', 'Over-Exploited'],
            'year': [2020, 2020, 2020, 2020, 2020, 2020],
            'latitude': [30.9, 30.4, 29.7, 29.5, 26.3, 25.8],
            'longitude': [75.9, 74.2, 76.8, 75.0, 73.0, 71.4]
        }
        return pd.DataFrame(data)

data_loader = DataLoader()

def load_dataset(dataset_name: str) -> Tuple[pd.DataFrame, bool, List[str]]:
    loaders = {
        "agricultural_exports": data_loader.load_agricultural_exports,
        "crop_water_footprint": data_loader.load_crop_water_footprint,
        "crop_production": data_loader.load_crop_production,
        "groundwater_assessment": data_loader.load_groundwater_assessment
    }
    if dataset_name not in loaders:
        return pd.DataFrame(), False, [f"Unknown dataset: {dataset_name}"]
    return loaders[dataset_name]()

def get_sample_dataset(dataset_name: str) -> pd.DataFrame:
    samples = {
        "agricultural_exports": data_loader.get_sample_agricultural_exports,
        "crop_water_footprint": data_loader.get_sample_crop_water_footprint,
        "crop_production": data_loader.get_sample_crop_production,
        "groundwater_assessment": data_loader.get_sample_groundwater_assessment
    }
    if dataset_name not in samples:
        return pd.DataFrame()
    return samples[dataset_name]()