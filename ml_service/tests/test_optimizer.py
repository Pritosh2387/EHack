import os
import pytest
from ml_service.app.schemas.optimization import OptimizationRequest
from ml_service.app.services.resource_optimizer_service import ResourceOptimizerService
from ml_service.app.data_loader import data_loader

@pytest.fixture(autouse=True)
def set_test_data_dir():
    original_dir = data_loader.data_dir
    data_loader.data_dir = r"C:\Users\Hp\OneDrive\Desktop\Hacathons\amazon\ml_service\tests\fixtures"
    yield
    data_loader.data_dir = original_dir

def test_optimizer_nonzero_allocation():
    # Initialize service with fixtures
    service = ResourceOptimizerService()
    
    request = OptimizationRequest(
        region="Punjab",
        objective="minimize_blue_water",
        time_period="2020-21",
        constraints={"min_production_factor": 0.8}
    )
    
    result = service.optimize_crop_allocation(request)
    
    # Assert successful optimization
    assert result.solver_status == "success"
    assert result.feasibility_status == "feasible"
    
    # Calculate total allocated area and production
    total_area = sum(result.optimized_allocation.values())
    total_production = result.optimized_production
    
    # Must be > 0
    assert total_area > 0, "Total allocated area should be strictly positive."
    assert total_production > 0, "Optimized production should be strictly positive."
    
    # Must meet the 80% baseline requirement
    # Baseline production from fixtures: 100% of max_area (1000) * yield (3 for rice, 4 for wheat)
    # wait, baseline allocation logic in fixtures has max_area=3000, wait, it calculates dynamically!
    assert total_production >= 0.79 * result.baseline_production
