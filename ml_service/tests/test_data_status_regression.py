import os
import tempfile
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from pathlib import Path

from ml_service.app.data_loader import DataLoader, data_loader
from ml_service.app.services.data_status_service import DataStatusService
from ml_service.app.services.crop_production_service import CropProductionService
from ml_service.app.services.export_analytics_service import ExportAnalyticsService
from ml_service.app.services.groundwater_service import GroundwaterService
from ml_service.app.main import app

REAL_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

@pytest.fixture
def real_loader():
    return DataLoader(data_dir=REAL_DATA_DIR)

def test_real_loader_paths(real_loader):
    assert os.path.isdir(real_loader.data_dir), f"Directory does not exist: {real_loader.data_dir}"
    for filename in [
        "agricultural_exports.csv",
        "crop_water_footprint.csv",
        "crop_production.csv",
        "groundwater_assessment.csv"
    ]:
        filepath = os.path.join(real_loader.data_dir, filename)
        assert os.path.isfile(filepath), f"File missing: {filepath}"
        assert os.path.getsize(filepath) > 0, f"File is empty: {filepath}"

def test_load_real_agricultural_exports(real_loader):
    df, success, errors = real_loader.load_agricultural_exports()
    assert success is True, f"Failed with errors: {errors}"
    assert errors == []
    assert len(df) == 3
    expected_cols = [
        "hs_code", "commodity_description", "original_quantity",
        "original_quantity_unit", "normalized_quantity_tonnes",
        "financial_year", "export_value", "currency", "source_reference"
    ]
    for col in expected_cols:
        assert col in df.columns
    assert set(df["commodity_description"].str.lower()) == {"non-basmati rice", "basmati rice", "wheat"}

def test_load_real_crop_water_footprint(real_loader):
    df, success, errors = real_loader.load_crop_water_footprint()
    assert success is True, f"Failed with errors: {errors}"
    assert errors == []
    assert len(df) == 20
    expected_cols = [
        "crop_or_product", "green_water", "blue_water", "grey_water",
        "coefficient_unit", "geographic_scope", "reference_period",
        "source_publication", "methodology"
    ]
    for col in expected_cols:
        assert col in df.columns
    assert "rice" in df["crop_or_product"].values
    assert "basmati rice" in df["crop_or_product"].values
    assert "wheat" in df["crop_or_product"].values

def test_load_real_crop_production(real_loader):
    df, success, errors = real_loader.load_crop_production()
    assert success is True, f"Failed with errors: {errors}"
    assert errors == []
    assert len(df) == 40
    expected_cols = ["state", "district", "crop", "year", "area", "production", "yield"]
    for col in expected_cols:
        assert col in df.columns
    # Check that district handles missing values without pandas NaN leaking as float
    assert df["district"].isnull().all() or df["district"].isna().any()
    assert "Punjab" in df["state"].values
    assert "Uttar Pradesh" in df["state"].values

def test_load_real_groundwater_assessment(real_loader):
    df, success, errors = real_loader.load_groundwater_assessment()
    assert success is True, f"Failed with errors: {errors}"
    assert errors == []
    assert len(df) == 5
    expected_cols = ["assessment_unit_id", "state", "district", "category", "year", "latitude", "longitude"]
    for col in expected_cols:
        assert col in df.columns
    assert (df["category"] == "Over-Exploited").all()
    assert (df["state"] == "Punjab").all()
    assert (df["district"] == "Ludhiana").all()

def test_data_status_service_with_real_data(real_loader):
    service = DataStatusService(loader=real_loader)
    status_resp = service.get_data_status()

    assert status_resp.overall_status == "ready"
    assert status_resp.missing_requirements == []
    assert status_resp.unsupported_calculations == []

    dataset_map = {d["name"]: d for d in status_resp.datasets}
    assert len(dataset_map) == 4

    assert dataset_map["agricultural_exports"]["available"] is True
    assert dataset_map["agricultural_exports"]["row_count"] == 3
    assert dataset_map["agricultural_exports"]["errors"] == []

    assert dataset_map["crop_water_footprint"]["available"] is True
    assert dataset_map["crop_water_footprint"]["row_count"] == 20
    assert dataset_map["crop_water_footprint"]["errors"] == []

    assert dataset_map["crop_production"]["available"] is True
    assert dataset_map["crop_production"]["row_count"] == 40
    assert dataset_map["crop_production"]["errors"] == []

    assert dataset_map["groundwater_assessment"]["available"] is True
    assert dataset_map["groundwater_assessment"]["row_count"] == 5
    assert dataset_map["groundwater_assessment"]["errors"] == []

    # Verify coverage does not falsely declare complete nationwide coverage
    assert "Punjab" in dataset_map["groundwater_assessment"]["geographic_coverage"]
    assert "Ludhiana" in dataset_map["groundwater_assessment"]["coverage_notes"]

    # Verify join_coverage
    jc = status_resp.join_coverage
    assert "overlapping_states" in jc
    assert "Punjab" in jc["overlapping_states"]
    assert "wheat" in jc["export_commodities"]

def test_schema_validation_error_actionability():
    """Verify that malformed or missing schemas produce actionable errors, not false positive 'available'."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        # Create an exports CSV missing required columns
        corrupt_exports = pd.DataFrame({
            "hs_code": ["1006"],
            "commodity_description": ["rice"],
            # missing normalized_quantity_tonnes, financial_year, export_value, etc.
        })
        corrupt_exports.to_csv(os.path.join(tmp_dir, "agricultural_exports.csv"), index=False)

        bad_loader = DataLoader(data_dir=tmp_dir)
        df, success, errors = bad_loader.load_agricultural_exports()
        assert success is False
        assert len(errors) > 0
        assert "Missing columns" in errors[0]

        # Verify that DataStatusService marks it unavailable and unsupported calculations include dependent
        status_service = DataStatusService(loader=bad_loader)
        status = status_service.get_data_status()
        assert status.overall_status == "unavailable"
        exp_entry = next(d for d in status.datasets if d["name"] == "agricultural_exports")
        assert exp_entry["available"] is False
        assert len(exp_entry["errors"]) > 0
        assert "export_water_footprint" in status.unsupported_calculations
        assert any("agricultural_exports" in req for req in status.missing_requirements)

from ml_service.app.api.routes.regions import crop_production_service as route_crop_service, groundwater_service as route_gw_service
from ml_service.app.api.routes.exports import export_service as route_exp_service

def test_live_api_with_real_data():
    """Test full FastAPI application with DataLoader pointing to real data."""
    orig_data_dir = data_loader.data_dir
    data_loader.data_dir = REAL_DATA_DIR
    route_crop_service.__init__()
    route_gw_service.__init__()
    route_exp_service.__init__()

    try:
        client = TestClient(app)

        # 1. Query /api/v1/data-status
        response = client.get("/api/v1/data-status")
        assert response.status_code == 200
        body = response.json()

        assert body["overall_status"] == "ready"
        assert body["missing_requirements"] == []
        assert body["unsupported_calculations"] == []
        assert len(body["datasets"]) == 4

        for d in body["datasets"]:
            assert d["available"] is True
            assert d["row_count"] > 0
            assert d["errors"] == []

        # 2. Query /api/v1/regions/crop-production with state-level data (district null)
        resp_prod = client.get("/api/v1/regions/crop-production", params={
            "state": "Punjab", "crop": "rice", "year": "2023-24"
        })
        assert resp_prod.status_code == 200
        prod_data = resp_prod.json()
        assert prod_data["count"] > 0
        assert prod_data["results"][0]["district"] is None

        # 3. Query /api/v1/exports/ledger for rice (matches APEDA categories)
        resp_exp_rice = client.get("/api/v1/exports/ledger", params={
            "crop": "rice", "financial_year": "2024-25", "water_component": "all"
        })
        assert resp_exp_rice.status_code == 200
        exp_data = resp_exp_rice.json()
        assert exp_data["count"] == 2  # basmati and non-basmati

        # 4. Query /api/v1/exports/ledger for wheat
        resp_exp_wheat = client.get("/api/v1/exports/ledger", params={
            "crop": "wheat", "financial_year": "2024-25", "water_component": "all"
        })
        assert resp_exp_wheat.status_code == 200
        assert resp_exp_wheat.json()["count"] == 1

        # 5. Query /api/v1/regions/groundwater-stress
        resp_gw = client.get("/api/v1/regions/groundwater-stress", params={"state": "Punjab"})
        assert resp_gw.status_code == 200
        gw_data = resp_gw.json()
        assert len(gw_data["assessment_units"]) == 5

    finally:
        data_loader.data_dir = orig_data_dir
        route_crop_service.__init__()
        route_gw_service.__init__()
        route_exp_service.__init__()
