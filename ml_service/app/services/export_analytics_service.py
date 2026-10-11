from typing import List, Dict, Any, Optional
from ml_service.app.schemas.exports import (
    ExportFootprintRequest,
    ExportLedgerResponse,
    ExportFootprintResult,
    ExportFiltersResponse,
)
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

    def get_available_filters(self) -> ExportFiltersResponse:
        if not self.is_real_export or not self.is_real_wf or self.export_data.empty:
            return ExportFiltersResponse(
                financial_years=[],
                commodities=[],
                default_financial_year=None,
                default_commodity=None,
                available=False,
                export_categories=[]
            )

        # Extract available financial years sorted descending
        years = sorted(self.export_data['financial_year'].dropna().astype(str).unique().tolist(), reverse=True)
        export_categories = sorted(self.export_data['commodity_description'].dropna().astype(str).unique().tolist())

        # Determine compatible commodities that exist in exports and have valid WF coefficients
        supported_crops = [c.lower() for c in data_loader.supported_crops]
        wf_products = self.water_footprint_data['crop_or_product'].str.lower().unique().tolist() if not self.water_footprint_data.empty else []

        compatible_commodities: List[str] = []
        for crop in supported_crops:
            exact = self.export_data['commodity_description'].str.lower() == crop
            substr = self.export_data['commodity_description'].str.lower().str.contains(crop, regex=False)
            matched_exports = self.export_data[exact | substr]
            if matched_exports.empty:
                continue

            has_wf = True
            for _, row in matched_exports.iterrows():
                cname = str(row['commodity_description']).lower()
                if cname not in wf_products and crop not in wf_products:
                    has_wf = False
                    break
            if has_wf:
                compatible_commodities.append(crop)

        default_year = years[0] if years else "2024-25"
        default_crop = compatible_commodities[0] if compatible_commodities else "rice"

        return ExportFiltersResponse(
            financial_years=years,
            commodities=compatible_commodities,
            default_financial_year=default_year,
            default_commodity=default_crop,
            available=True,
            export_categories=export_categories
        )

    def get_exports_ledger(self, request: ExportFootprintRequest) -> ExportLedgerResponse:
        if not self.is_real_export or not self.is_real_wf:
            raise ValueError("Real agricultural exports dataset or crop water footprint dataset is unavailable or failed validation.")

        crop_req = request.crop.lower().strip()
        valid_crops = [c.lower() for c in data_loader.supported_crops] + self.export_data['commodity_description'].str.lower().unique().tolist()
        if crop_req not in valid_crops:
            raise ValueError(f"Unsupported commodity: '{request.crop}'. Supported commodities in export dataset: rice, wheat.")

        # Filter export data: exact match or substring match
        exact_match = self.export_data['commodity_description'].str.lower() == crop_req
        substr_match = self.export_data['commodity_description'].str.lower().str.contains(crop_req, regex=False)
        export_filtered = self.export_data[exact_match | substr_match]

        if request.financial_year:
            fy_req = str(request.financial_year).strip()
            export_filtered = export_filtered[
                export_filtered['financial_year'].astype(str) == fy_req
            ]

        # If no export records match, return an empty ledger response instead of an unhandled failure
        if export_filtered.empty:
            available_years = sorted(self.export_data['financial_year'].dropna().astype(str).unique().tolist())
            msg = f"No export data found for crop: {request.crop}" + (f" in financial year: {request.financial_year}" if request.financial_year else "")
            if available_years:
                msg += f". Loaded export dataset contains records for FY: {', '.join(available_years)}."
            return ExportLedgerResponse(
                results=[],
                count=0,
                filters_applied={
                    "crop": request.crop,
                    "financial_year": request.financial_year,
                    "water_component": request.water_component or "all"
                },
                generated_at=datetime.now(),
                message=msg
            )

        water_comp = (request.water_component or "all").lower().strip()

        # Calculate results for each export record
        results = []
        for _, export_row in export_filtered.iterrows():
            comm_name = str(export_row['commodity_description']).lower()
            wf_data = self.water_footprint_data[
                self.water_footprint_data['crop_or_product'].str.lower() == comm_name
            ]
            if wf_data.empty:
                wf_data = self.water_footprint_data[
                    self.water_footprint_data['crop_or_product'].str.lower() == crop_req
                ]
            if wf_data.empty:
                raise ValueError(f"No water footprint data found for crop: {comm_name}")

            wf_row = wf_data.iloc[0]
            export_data_provenance = export_row.get('source_reference', 'OBSERVED')
            water_coeff_provenance = wf_row.get('source_publication', 'PUBLISHED_REAL_ARTICLE_SOURCED')
            
            # Geographic scope & scientific interpretation limitations
            geographic_scope = wf_row.get('geographic_scope', 'Global estimate')
            ref_period = wf_row.get('reference_period', '1996-2005')
            limitations_list = [
                f"Water footprint coefficients are published global historical estimates (Mekonnen & Hoekstra 2011, {ref_period}; scope: {geographic_scope}), not current India-specific measurements.",
                "Grey water footprint represents theoretical assimilation/dilution volume needed to meet ambient water quality standards; it is not physical water consumed or abstracted.",
                "National agricultural export trade statistics represent official APEDA product aggregates and cannot be attributed to a specific state or district aquifer.",
                "Export trade statistics reflect reported formal trade volumes and may not capture informal cross-border trade."
            ]

            qty = float(export_row.get('normalized_quantity_tonnes', export_row['original_quantity']))
            exp_val = float(export_row['export_value']) if 'export_value' in export_row and pd.notna(export_row['export_value']) else None
            exp_curr = str(export_row.get('currency', 'USD')) if 'currency' in export_row else 'USD'

            green_coeff = float(wf_row['green_water']) if water_comp in ['green', 'all'] else None
            blue_coeff = float(wf_row['blue_water']) if water_comp in ['blue', 'all'] else None
            grey_coeff = float(wf_row['grey_water']) if water_comp in ['grey', 'all'] else None

            est_green = qty * green_coeff if green_coeff is not None else None
            est_blue = qty * blue_coeff if blue_coeff is not None else None
            est_grey = qty * grey_coeff if grey_coeff is not None else None

            result = ExportFootprintResult(
                crop=str(export_row['commodity_description']),
                financial_year=str(export_row['financial_year']),
                export_quantity=qty,
                export_quantity_unit="tonnes",
                export_value=exp_val,
                export_value_currency=exp_curr,
                green_water_coefficient=green_coeff,
                blue_water_coefficient=blue_coeff,
                grey_water_coefficient=grey_coeff,
                coefficient_unit=str(wf_row.get('coefficient_unit', "m³/tonne")),
                estimated_green_water=est_green,
                estimated_blue_water=est_blue,
                estimated_grey_water=est_grey,
                footprint_unit="m³",
                calculation_methodology=str(wf_row.get('methodology', "Export quantity (tonnes) × Water footprint coefficient (m³/tonne)")),
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
            if water_comp == "all":
                total = 0.0
                if result.estimated_green_water is not None:
                    total += result.estimated_green_water
                if result.estimated_blue_water is not None:
                    total += result.estimated_blue_water
                if result.estimated_grey_water is not None:
                    total += result.estimated_grey_water
                result.total_water_footprint = total

            results.append(result)

        return ExportLedgerResponse(
            results=results,
            count=len(results),
            filters_applied={
                "crop": request.crop,
                "financial_year": request.financial_year,
                "water_component": water_comp
            },
            generated_at=datetime.now()
        )