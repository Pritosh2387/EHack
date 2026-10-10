from typing import List, Dict, Any, Optional
from ml_service.app.schemas.exports import ExportFootprintRequest, ExportLedgerResponse, ExportFootprintResult
from datetime import datetime
import pandas as pd
import numpy as np
import os
from ml_service.app.data_loader import data_loader

class ExportAnalyticsService:
    def __init__(self):
        df_exp, suc_exp, err_exp = data_loader.load_agricultural_exports()
        self.export_data = df_exp if suc_exp else pd.DataFrame()
        self.is_real_export = suc_exp
        
        df_wf, suc_wf, err_wf = data_loader.load_crop_water_footprint()
        self.water_footprint_data = df_wf if suc_wf else pd.DataFrame()
        self.is_real_wf = suc_wf

    def get_exports_ledger(self, request: ExportFootprintRequest) -> ExportLedgerResponse:
        if not self.is_real_export or not self.is_real_wf:
            raise ValueError("Real agricultural exports dataset or crop water footprint dataset is unavailable or failed validation.")

        # Validate crop
        if request.crop.lower() not in [c.lower() for c in data_loader.supported_crops]:
            raise ValueError(f"Unsupported crop: {request.crop}")

        # Filter export data
        export_filtered = self.export_data[
            (self.export_data['commodity_description'].str.lower() == request.crop.lower())
        ]

        if request.financial_year:
            export_filtered = export_filtered[
                export_filtered['financial_year'] == request.financial_year
            ]

        if export_filtered.empty:
            raise ValueError(f"No export data found for crop: {request.crop}" +
                           (f" in year: {request.financial_year}" if request.financial_year else ""))

        # Get water footprint coefficients
        wf_data = self.water_footprint_data[
            self.water_footprint_data['crop_or_product'].str.lower() == request.crop.lower()
        ]

        if wf_data.empty:
            raise ValueError(f"No water footprint data found for crop: {request.crop}")

        wf_row = wf_data.iloc[0]

        # Calculate results for each export record
        results = []
        for _, export_row in export_filtered.iterrows():
            export_data_provenance = export_row.get('source_reference', 'OBSERVED')
            water_coeff_provenance = wf_row.get('source_publication', 'PUBLISHED_REAL_ARTICLE_SOURCED')
            
            # Extract geographic scope to ensure we mention it in limitations if it's global
            geographic_scope = wf_row.get('geographic_scope', 'Unknown')
            limitations_list = [
                f"Water footprint coefficients are based on geographic scope: {geographic_scope}",
                "Export data may not capture all informal trade channels"
            ]
            if geographic_scope.lower() != "india-specific":
                limitations_list.append("Coefficients based on global averages, may lack India-specific precision")

            qty = float(export_row.get('normalized_quantity_tonnes', export_row['original_quantity']))
            
            result = ExportFootprintResult(
                crop=export_row['commodity_description'],
                financial_year=export_row['financial_year'],
                export_quantity=qty,
                export_quantity_unit="tonnes",
                green_water_coefficient=wf_row['green_water'] if request.water_component in ['green', 'all'] else None,
                blue_water_coefficient=wf_row['blue_water'] if request.water_component in ['blue', 'all'] else None,
                grey_water_coefficient=wf_row['grey_water'] if request.water_component in ['grey', 'all'] else None,
                coefficient_unit=wf_row.get('coefficient_unit', "m³/tonne"),
                estimated_green_water=qty * wf_row['green_water'] if request.water_component in ['green', 'all'] else None,
                estimated_blue_water=qty * wf_row['blue_water'] if request.water_component in ['blue', 'all'] else None,
                estimated_grey_water=qty * wf_row['grey_water'] if request.water_component in ['grey', 'all'] else None,
                footprint_unit="m³",
                calculation_methodology=wf_row.get('methodology', "Export quantity × Water footprint coefficient"),
                data_sources=[
                    str(export_row.get('source_reference', "Trade Data")),
                    str(wf_row.get('source_publication', "Water Footprint Network"))
                ],
                provenance={
                    "export_data": export_data_provenance,
                    "water_coefficients": water_coeff_provenance,
                    "calculation": "INFERRED"
                },
                limitations=limitations_list
            )

            # Calculate total water footprint if all components requested
            if request.water_component == "all":
                total = 0
                if result.estimated_green_water:
                    total += result.estimated_green_water
                if result.estimated_blue_water:
                    total += result.estimated_blue_water
                if result.estimated_grey_water:
                    total += result.estimated_grey_water
                result.total_water_footprint = total

            results.append(result)

        return ExportLedgerResponse(
            results=results,
            count=len(results),
            filters_applied={
                "crop": request.crop,
                "financial_year": request.financial_year,
                "water_component": request.water_component
            },
            generated_at=datetime.now()
        )