from ml_service.app.schemas.common import DataStatusResponse
from ml_service.app.data_loader import data_loader
from datetime import datetime
from typing import Dict, Any, List

class DataStatusService:
    def __init__(self, loader=None):
        self.loader = loader or data_loader

    def get_data_status(self) -> DataStatusResponse:
        statuses = self.loader.get_all_datasets_status()

        datasets_status = []
        missing_requirements = []

        for name, info in statuses.items():
            is_avail = info["available"]
            entry = {
                "name": name,
                "available": is_avail,
                "description": info["description"],
                "source": info["source"],
                "row_count": info["row_count"],
                "errors": info["errors"],
                "period": info.get("period", ""),
                "geographic_coverage": info.get("geographic_coverage", ""),
                "coverage_notes": info.get("coverage_notes", "")
            }
            datasets_status.append(entry)

            if not is_avail:
                err_detail = f" (Errors: {'; '.join(info['errors'])})" if info["errors"] else ""
                missing_requirements.append(f"Dataset: {name}{err_detail}")

        # Determine overall status
        available_count = sum(1 for d in datasets_status if d["available"])
        total_count = len(datasets_status)

        if available_count == total_count:
            overall_status = "ready"
        elif available_count > 0:
            overall_status = "partial"
        else:
            overall_status = "unavailable"

        # Determine unsupported calculations based on dataset availability
        avail_map = {d["name"]: d["available"] for d in datasets_status}
        unsupported_calculations = []

        if not (avail_map.get("agricultural_exports", False) and avail_map.get("crop_water_footprint", False)):
            unsupported_calculations.append("export_water_footprint")

        if not avail_map.get("crop_production", False):
            unsupported_calculations.append("regional_crop_production")

        if not avail_map.get("groundwater_assessment", False):
            unsupported_calculations.append("groundwater_stress")

        if not (avail_map.get("crop_production", False) and avail_map.get("crop_water_footprint", False)):
            unsupported_calculations.append("crop_shift_scenario")

        if not (avail_map.get("crop_production", False) and avail_map.get("crop_water_footprint", False)):
            unsupported_calculations.append("resource_optimization")

        if not (avail_map.get("crop_production", False) and avail_map.get("crop_water_footprint", False) and avail_map.get("agricultural_exports", False)):
            unsupported_calculations.append("sensitivity_analysis")

        # Compute join coverage
        join_coverage = self._compute_join_coverage()

        return DataStatusResponse(
            overall_status=overall_status,
            datasets=datasets_status,
            missing_requirements=missing_requirements,
            unsupported_calculations=unsupported_calculations,
            join_coverage=join_coverage,
            last_updated=datetime.now().strftime("%Y-%m-%d")
        )

    def _compute_join_coverage(self) -> Dict[str, Any]:
        coverage = {
            "starter_pack_active": True,
            "coverage_summary": "Starter dataset pack with limited geographic and commodity coverage; not full national census.",
            "production_states": [],
            "groundwater_states": [],
            "overlapping_states": [],
            "export_commodities": [],
            "crop_footprint_count": 0,
            "export_years": [],
            "production_years": [],
            "groundwater_years": []
        }
        try:
            df_exp, suc_exp, _ = self.loader.load_agricultural_exports()
            if suc_exp and not df_exp.empty:
                coverage["export_commodities"] = sorted(df_exp["commodity_description"].astype(str).unique().tolist())
                if "financial_year" in df_exp.columns:
                    coverage["export_years"] = sorted(df_exp["financial_year"].astype(str).unique().tolist())

            df_wf, suc_wf, _ = self.loader.load_crop_water_footprint()
            if suc_wf and not df_wf.empty:
                coverage["crop_footprint_count"] = len(df_wf)

            df_prod, suc_prod, _ = self.loader.load_crop_production()
            if suc_prod and not df_prod.empty:
                prod_states = sorted(df_prod["state"].dropna().unique().tolist())
                coverage["production_states"] = prod_states
                if "year" in df_prod.columns:
                    coverage["production_years"] = sorted(df_prod["year"].astype(str).unique().tolist())

            df_gw, suc_gw, _ = self.loader.load_groundwater_assessment()
            if suc_gw and not df_gw.empty:
                gw_states = sorted(df_gw["state"].dropna().unique().tolist())
                coverage["groundwater_states"] = gw_states
                if "year" in df_gw.columns:
                    coverage["groundwater_years"] = sorted(df_gw["year"].dropna().unique().tolist())

            if coverage["production_states"] and coverage["groundwater_states"]:
                coverage["overlapping_states"] = sorted(list(
                    set(coverage["production_states"]).intersection(set(coverage["groundwater_states"]))
                ))
        except Exception:
            pass
        return coverage