from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
import os
from ml_service.app.data_loader import data_loader

class GroundwaterService:
    def __init__(self):
        # Load from data loader, not fallback to sample data
        df, success, errors = data_loader.load_groundwater_assessment()
        self.groundwater_data = df if success else pd.DataFrame()
        self.is_real_data = success
        self.load_errors = errors
        self.data_source = "Central Ground Water Board (CGWB), Government of India"

    def get_groundwater_assessment(self, state: str = None, district: str = None,
                                 category: str = None, year: str = None) -> dict:
        
        if not self.is_real_data:
            return {
                "assessment_units": [],
                "summary": {
                    "total_units": 0,
                    "safe": 0,
                    "semi_critical": 0,
                    "critical": 0,
                    "over_exploited": 0,
                    "saline": 0
                },
                "data_source": self.data_source,
                "provenance": {"assessment_data": "UNAVAILABLE", "classification": "UNAVAILABLE"},
                "limitations": ["Real groundwater assessment data is unavailable or failed validation.",
                                "PDF parsing for groundwater data is not implemented. Please provide CSV or Excel."] + self.load_errors,
                "filters_applied": {
                    "state": state,
                    "district": district,
                    "category": category,
                    "year": year
                },
                "last_updated": datetime.now().strftime("%Y-%m-%d"),
                "data_availability": {
                    "real_data_parsed_and_usable": False,
                    "validation_errors": self.load_errors
                }
            }

        # Filter data based on request
        filtered_data = self.groundwater_data.copy()

        if state:
            filtered_data = filtered_data[filtered_data['state'].str.lower() == state.lower()]
        if district:
            filtered_data = filtered_data[filtered_data['district'].str.lower() == district.lower()]
        if category:
            filtered_data = filtered_data[filtered_data['category'].str.lower() == category.lower()]
        if year:
            try:
                y_val = int(year)
                filtered_data = filtered_data[filtered_data['year'] == y_val]
            except (ValueError, TypeError):
                filtered_data = filtered_data.iloc[0:0]

        # Convert to response format
        assessment_units = []
        for _, row in filtered_data.iterrows():
            unit = {
                "assessment_unit_id": row['assessment_unit_id'],
                "state": row['state'],
                "district": row['district'],
                "category": row['category'],
                "year": int(row['year']),
            }
            if 'latitude' in row and pd.notna(row['latitude']):
                unit['latitude'] = row['latitude']
            if 'longitude' in row and pd.notna(row['longitude']):
                unit['longitude'] = row['longitude']
            assessment_units.append(unit)

        # Calculate summary statistics
        category_counts = filtered_data['category'].value_counts()
        summary = {
            "total_units": len(filtered_data),
            "safe": int(category_counts.get('Safe', 0)),
            "semi_critical": int(category_counts.get('Semi-Critical', 0)),
            "critical": int(category_counts.get('Critical', 0)),
            "over_exploited": int(category_counts.get('Over-Exploited', 0)),
            "saline": int(category_counts.get('Saline', 0))
        }

        provenance = {
            "assessment_data": "REAL_DATA_VALIDATED_AND_LOADED",
            "classification": "REAL_DATA_VALIDATED_AND_LOADED"
        }
        limitations = [
            "Groundwater assessments are conducted periodically and may not reflect real-time conditions",
            "Classification criteria are based on specific thresholds of groundwater development",
            "Assessment units represent administrative boundaries that may not align perfectly with hydrogeological boundaries"
        ]

        return {
            "assessment_units": assessment_units,
            "summary": summary,
            "data_source": self.data_source,
            "provenance": provenance,
            "limitations": limitations,
            "filters_applied": {
                "state": state,
                "district": district,
                "category": category,
                "year": year
            },
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "data_availability": {
                "real_data_parsed_and_usable": True,
                "validation_errors": []
            }
        }