from typing import List, Dict, Any, Optional
from ml_service.app.schemas.regions import CropProductionRequest, CropProductionResponse, CropProductionResult
from datetime import datetime
import pandas as pd
import numpy as np
from ml_service.app.data_loader import data_loader

class CropProductionService:
    def __init__(self):
        # Load from data loader, not fallback to sample data
        df, success, errors = data_loader.load_crop_production()
        self.production_data = df if success else pd.DataFrame()
        self.is_real_data = success

    def get_crop_production(self, request: CropProductionRequest) -> CropProductionResponse:
        if not self.is_real_data:
            raise ValueError("Real crop production dataset is unavailable or failed validation.")
            
        # Filter data based on request
        filtered_data = self.production_data.copy()

        if request.state:
            filtered_data = filtered_data[filtered_data['state'].fillna('').astype(str).str.lower() == request.state.lower()]
        if request.district:
            filtered_data = filtered_data[filtered_data['district'].fillna('').astype(str).str.lower() == request.district.lower()]
        if request.crop:
            filtered_data = filtered_data[filtered_data['crop'].fillna('').astype(str).str.lower() == request.crop.lower()]
        if request.year:
            filtered_data = filtered_data[filtered_data['year'].astype(str) == str(request.year)]

        if filtered_data.empty:
            # We return empty instead of raising an error if the region/year is not found
            pass

        # Convert to response format
        results = []
        for _, row in filtered_data.iterrows():
            calc_yield = row['production'] / row['area'] if row['area'] > 0 else 0
            is_inferred = abs(row['yield'] - calc_yield) > 0.1
            result = CropProductionResult(
                state=row['state'],
                district=str(row['district']) if pd.notna(row['district']) and row['district'] is not None else None,
                crop=row['crop'],
                year=str(row['year']),
                area=float(row['area']) if pd.notna(row['area']) else None,
                production=float(row['production']) if pd.notna(row['production']) else None,
                yield_=float(row['yield']) if pd.notna(row['yield']) else None,
                data_source="Ministry of Agriculture and Farmers Welfare, Government of India",
                provenance={
                    "area_data": "OBSERVED",
                    "production_data": "OBSERVED",
                    "yield_calculated": "INFERRED" if is_inferred else "OBSERVED"
                },
                limitations=[
                    "Data represents officially reported statistics and may not capture all farm-level variations",
                    "Yield calculated as production/area where not directly observed",
                    "Reporting periods and definitions may vary across states"
                ]
            )
            results.append(result)

        return CropProductionResponse(
            results=results,
            count=len(results),
            filters_applied={
                "state": request.state,
                "district": request.district,
                "crop": request.crop,
                "year": request.year
            },
            generated_at=datetime.now()
        )