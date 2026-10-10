from typing import List, Dict, Any, Optional
from ml_service.app.schemas.optimization import OptimizationRequest, OptimizationResult
from ml_service.app.data_loader import data_loader
import pandas as pd
import numpy as np
from scipy.optimize import linprog

class ResourceOptimizerService:
    def __init__(self):
        df_prod, suc_prod, _ = data_loader.load_crop_production()
        self.production_data = df_prod if suc_prod else pd.DataFrame()
        self.is_real_prod = suc_prod
        
        df_wf, suc_wf, _ = data_loader.load_crop_water_footprint()
        self.water_footprint_data = df_wf if suc_wf else pd.DataFrame()
        self.is_real_wf = suc_wf

    def optimize_crop_allocation(self, request: OptimizationRequest) -> OptimizationResult:
        if not self.is_real_prod or not self.is_real_wf:
            raise ValueError("Real crop production dataset or crop water footprint dataset is unavailable or failed validation.")

        region = request.region
        time_period = request.time_period
        constraints = request.constraints or {}

        try:
            crops, baseline_allocation, water_coeffs, yields, max_area = self._get_real_optimization_data(region, time_period)
        except ValueError as e:
            raise ValueError(f"Could not load data for optimization: {str(e)}")

        water_per_hectare = {}
        for crop in crops:
            if crop in water_coeffs and crop in yields:
                water_per_hectare[crop] = water_coeffs[crop] * yields[crop]
            else:
                water_per_hectare[crop] = 0

        c = [water_per_hectare.get(crop, 0) for crop in crops]
        A_eq = [[1.0] * len(crops)]
        b_eq = [max_area]

        baseline_production = {}
        total_baseline_production = 0
        for crop in crops:
            if crop in baseline_allocation and crop in yields:
                area_allocated = (baseline_allocation.get(crop, 0) / 100.0) * max_area
                production = area_allocated * yields[crop]
                baseline_production[crop] = production
                total_baseline_production += production

        min_production_factor = constraints.get('min_production_factor', 0.8)
        min_total_production = total_baseline_production * min_production_factor

        A_ub = []
        b_ub = []
        neg_yields = [-yields.get(crop, 0) for crop in crops]
        A_ub.append(neg_yields)
        b_ub.append(-min_total_production)

        # Enforce that total area > 0 and min production > 0 to prevent zero-allocation
        if max_area <= 0:
            raise ValueError("Maximum area is zero or negative, cannot optimize.")
        if min_total_production <= 0:
            raise ValueError("Minimum production constraint is zero or negative, which could lead to trivial solutions.")

        bounds = [(0, None) for _ in crops]

        try:
            result = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')

            if result.success:
                optimized_allocation_dict = dict(zip(crops, [round(x, 2) for x in result.x]))

                baseline_water_demand = sum(
                    baseline_allocation.get(crop, 0) / 100.0 * max_area * water_per_hectare.get(crop, 0)
                    for crop in crops
                )

                optimized_water_demand = sum(
                    optimized_allocation_dict.get(crop, 0) * water_per_hectare.get(crop, 0)
                    for crop in crops
                )

                baseline_production_calc = sum(
                    baseline_allocation.get(crop, 0) / 100.0 * max_area * yields.get(crop, 0)
                    for crop in crops
                )

                optimized_production = sum(
                    optimized_allocation_dict.get(crop, 0) * yields.get(crop, 0)
                    for crop in crops
                )

                water_demand_difference = optimized_water_demand - baseline_water_demand
                water_demand_difference_percent = (
                    (water_demand_difference / baseline_water_demand * 100)
                    if baseline_water_demand != 0 else 0
                )

                production_difference = optimized_production - baseline_production_calc
                production_difference_percent = (
                    (production_difference / baseline_production_calc * 100)
                    if baseline_production_calc != 0 else 0
                )

                return OptimizationResult(
                    region=region,
                    objective=request.objective,
                    time_period=time_period,
                    baseline_allocation=baseline_allocation,
                    optimized_allocation=optimized_allocation_dict,
                    baseline_blue_water_demand=baseline_water_demand,
                    optimized_blue_water_demand=optimized_water_demand,
                    water_demand_difference=water_demand_difference,
                    water_demand_difference_percent=water_demand_difference_percent,
                    baseline_production=baseline_production_calc,
                    optimized_production=optimized_production,
                    production_difference=production_difference,
                    production_difference_percent=production_difference_percent,
                    solver_used="Scipy Optimize (linprog)",
                    solver_status="success",
                    feasibility_status="feasible",
                    calculation_methodology="Linear programming to minimize blue water demand subject to land use and production constraints",
                    data_sources=[
                        "Ministry of Agriculture and Farmers Welfare, Government of India",
                        "Mekonnen and Hoekstra (2011), Water Footprint Network"
                    ],
                    provenance={
                        "yield_data": "OBSERVED",
                        "water_coefficients": "PUBLISHED",
                        "allocation_data": "OBSERVED (baseline), OPTIMIZED (scenario)",
                        "optimization": "INFERRED"
                    },
                    assumptions=[
                        "Linear relationship between area and water demand",
                        "Constant yields and water coefficients across area",
                        "No interaction effects between crops",
                        "Total cultivated area must equal available land (prevents zero-allocation)",
                        "Minimum production requirement enforced strictly > 0 to prevent trivial zero-production",
                        "All allocated area can be cultivated with selected crops"
                    ],
                    limitations=[
                        "Simplified linear model may not capture complex agro-ecological interactions",
                        "Assumes homogeneous land quality across the region",
                        "Does not consider market demands, prices, or socio-economic factors"
                    ]
                )
            else:
                return OptimizationResult(
                    region=region,
                    objective=request.objective,
                    time_period=time_period,
                    baseline_allocation=baseline_allocation,
                    optimized_allocation={},
                    solver_used="Scipy Optimize (linprog)",
                    solver_status="failed: " + str(result.message),
                    feasibility_status="infeasible or unbounded",
                    calculation_methodology="Linear programming attempted but failed",
                    data_sources=[],
                    provenance={"optimization": "FAILED"},
                    assumptions=["See limitations"],
                    limitations=["Optimization problem may be infeasible"]
                )
        except Exception as e:
            return OptimizationResult(
                region=region,
                objective=request.objective,
                time_period=time_period,
                baseline_allocation={},
                optimized_allocation={},
                solver_used="Error",
                solver_status=f"error: {str(e)}",
                feasibility_status="error",
                calculation_methodology="Optimization failed",
                data_sources=[],
                provenance={"error": str(e)},
                assumptions=[],
                limitations=[f"Unexpected error: {str(e)}"]
            )

    def _get_real_optimization_data(self, region: str, year: Optional[str]):
        df_prod = self.production_data[self.production_data['state'].str.lower() == region.lower()]
        if year:
            df_year = df_prod[df_prod['year'].astype(str) == str(year)]
            if not df_year.empty:
                df_prod = df_year
        if df_prod.empty:
            raise ValueError(f"No production data for region {region}")

        # Calculate max area (sum of area)
        max_area = df_prod['area'].sum()
        if max_area <= 0:
            raise ValueError(f"Total area is zero for region {region}")

        # Calculate yields and baseline allocation
        crops = df_prod['crop'].unique().tolist()
        yields = {}
        baseline_allocation = {}
        
        for c in crops:
            c_data = df_prod[df_prod['crop'] == c]
            c_area = c_data['area'].sum()
            c_prod = c_data['production'].sum()
            yields[c] = c_prod / c_area if c_area > 0 else 0
            baseline_allocation[c] = (c_area / max_area) * 100

        # Get water coefficients
        water_coeffs = {}
        for c in crops:
            df_wf = self.water_footprint_data[self.water_footprint_data['crop_or_product'] == c]
            if not df_wf.empty:
                water_coeffs[c] = float(df_wf['blue_water'].mean())
            else:
                water_coeffs[c] = 0

        return crops, baseline_allocation, water_coeffs, yields, max_area