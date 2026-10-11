import os
import pytest
from fastapi.testclient import TestClient
from ml_service.app.main import app
from ml_service.app.data_loader import data_loader
from ml_service.app.api.routes.regions import crop_production_service, groundwater_service

REAL_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

@pytest.fixture(autouse=True)
def setup_real_region_data():
    orig_dir = data_loader.data_dir
    data_loader.data_dir = REAL_DATA_DIR
    crop_production_service.__init__()
    groundwater_service.__init__()
    yield
    data_loader.data_dir = orig_dir
    crop_production_service.__init__()
    groundwater_service.__init__()

def test_regional_filters_metadata_with_real_data():
    client = TestClient(app)
    response = client.get("/api/v1/regions/filters")
    assert response.status_code == 200
    data = response.json()

    assert data["available"] is True
    assert "Punjab" in data["production_states"]
    assert "Uttar Pradesh" in data["production_states"]
    assert len(data["production_states"]) == 16

    assert data["groundwater_states"] == ["Punjab"]
    assert data["overlapping_states"] == ["Punjab"]
    assert set(data["crop_years"]) == {"2023-24", "2024-25"}
    assert data["groundwater_years"] == ["2022"]
    assert set(data["crops"]) == {"rice", "wheat"}

    assert data["default_state"] == "Punjab"
    assert data["default_crop"] == "rice"
    assert data["default_crop_year"] == "2023-24"
    assert data["default_groundwater_year"] == "2022"

    assert "rice" in data["crops_by_state"]["Punjab"]
    assert "wheat" in data["crops_by_state"]["Punjab"]
    assert data["crops_by_state"]["Haryana"] == ["wheat"]
    assert data["districts_by_state"]["Punjab"] == ["Ludhiana"]

def test_punjab_rice_2023_24_crop_production():
    client = TestClient(app)
    response = client.get("/api/v1/regions/crop-production", params={
        "state": "Punjab",
        "crop": "rice",
        "year": "2023-24"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 1
    result = data["results"][0]
    assert result["state"] == "Punjab"
    assert result["crop"] == "rice"
    assert result["year"] == "2023-24"
    assert result["production"] == 14360000.0
    assert result["production_unit"] == "tonnes"
    assert result["area"] == 3180000.0
    assert result["area_unit"] == "hectares"
    assert result["yield_"] == 4.516
    assert result["district"] is None

def test_punjab_wheat_2024_25_crop_production():
    client = TestClient(app)
    response = client.get("/api/v1/regions/crop-production", params={
        "state": "Punjab",
        "crop": "wheat",
        "year": "2024-25"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 1
    result = data["results"][0]
    assert result["state"] == "Punjab"
    assert result["crop"] == "wheat"
    assert result["year"] == "2024-25"
    assert result["production"] == 17990000.0
    assert result["production_unit"] == "tonnes"
    assert result["area"] == 3510000.0
    assert result["yield_"] == 5.123

def test_punjab_groundwater_2022():
    client = TestClient(app)
    response = client.get("/api/v1/regions/groundwater-stress", params={
        "state": "Punjab",
        "year": "2022"
    })
    assert response.status_code == 200
    data = response.json()

    summary = data["summary"]
    assert summary["total_units"] == 5
    assert summary["over_exploited"] == 5
    assert summary["safe"] == 0
    assert summary["critical"] == 0
    assert summary["semi_critical"] == 0
    assert summary["saline"] == 0

    assert len(data["assessment_units"]) == 5
    for unit in data["assessment_units"]:
        assert unit["state"] == "Punjab"
        assert unit["district"] == "Ludhiana"
        assert unit["category"] == "Over-Exploited"
        assert unit["year"] == 2022
        # Verify coordinates are absent (preserving scientific map integrity)
        assert unit.get("latitude") is None
        assert unit.get("longitude") is None

def test_state_without_groundwater_coverage():
    client = TestClient(app)
    # Uttar Pradesh has crop production
    crop_resp = client.get("/api/v1/regions/crop-production", params={
        "state": "Uttar Pradesh",
        "crop": "rice",
        "year": "2023-24"
    })
    assert crop_resp.status_code == 200
    assert crop_resp.json()["count"] == 1
    assert crop_resp.json()["results"][0]["production"] == 15990000.0

    # Uttar Pradesh does NOT have groundwater records in the starter dataset
    gw_resp = client.get("/api/v1/regions/groundwater-stress", params={
        "state": "Uttar Pradesh",
        "year": "2022"
    })
    assert gw_resp.status_code == 200
    gw_data = gw_resp.json()
    assert gw_data["summary"]["total_units"] == 0
    assert len(gw_data["assessment_units"]) == 0

def test_unsupported_years_return_zero_records():
    client = TestClient(app)
    # Old crop year 2020-21 has no records
    crop_resp = client.get("/api/v1/regions/crop-production", params={
        "state": "Punjab",
        "crop": "rice",
        "year": "2020-21"
    })
    assert crop_resp.status_code == 200
    assert crop_resp.json()["count"] == 0
    assert crop_resp.json()["results"] == []

    # Old groundwater year 2020 has no records
    gw_resp = client.get("/api/v1/regions/groundwater-stress", params={
        "state": "Punjab",
        "year": "2020"
    })
    assert gw_resp.status_code == 200
    assert gw_resp.json()["summary"]["total_units"] == 0
    assert gw_resp.json()["assessment_units"] == []

def test_district_level_distinction():
    client = TestClient(app)
    # In loaded dataset, district column is empty for production
    crop_resp = client.get("/api/v1/regions/crop-production", params={
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "rice",
        "year": "2023-24"
    })
    assert crop_resp.status_code == 200
    assert crop_resp.json()["count"] == 0

    # Groundwater records DO have Ludhiana district
    gw_resp = client.get("/api/v1/regions/groundwater-stress", params={
        "state": "Punjab",
        "district": "Ludhiana",
        "year": "2022"
    })
    assert gw_resp.status_code == 200
    assert gw_resp.json()["summary"]["total_units"] == 5

def test_regions_overview_endpoint():
    client = TestClient(app)
    response = client.get("/api/v1/regions/overview", params={
        "state": "Punjab",
        "year": "2023-24",
        "groundwater_year": "2022"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["crop_production"]["count"] >= 1
    assert data["groundwater_assessment"]["summary"]["total_units"] == 5
