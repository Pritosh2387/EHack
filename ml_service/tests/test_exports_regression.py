import os
import pytest
from fastapi.testclient import TestClient
from ml_service.app.main import app
from ml_service.app.data_loader import data_loader
from ml_service.app.api.routes.exports import export_service

REAL_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

@pytest.fixture(autouse=True)
def setup_real_export_data():
    orig_dir = data_loader.data_dir
    data_loader.data_dir = REAL_DATA_DIR
    export_service.__init__()
    yield
    data_loader.data_dir = orig_dir
    export_service.__init__()

def test_export_filters_metadata_with_real_data():
    client = TestClient(app)
    response = client.get("/api/v1/exports/filters")
    assert response.status_code == 200
    data = response.json()

    assert data["available"] is True
    assert data["financial_years"] == ["2024-25"]
    assert "rice" in data["commodities"]
    assert "wheat" in data["commodities"]
    assert "sugarcane" not in data["commodities"]  # No export data in starter pack
    assert data["default_financial_year"] == "2024-25"
    assert data["default_commodity"] == "rice"
    assert set(data["export_categories"]) == {"basmati rice", "non-basmati rice", "wheat"}

def test_rice_exports_matches_both_categories_without_double_counting():
    client = TestClient(app)
    response = client.get("/api/v1/exports/ledger", params={
        "crop": "rice",
        "financial_year": "2024-25",
        "water_component": "all"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 2
    categories = {r["crop"]: r for r in data["results"]}
    assert "non-basmati rice" in categories
    assert "basmati rice" in categories

    non_basmati = categories["non-basmati rice"]
    basmati = categories["basmati rice"]

    # Quantities in tonnes
    assert non_basmati["export_quantity"] == 14128955.0
    assert non_basmati["export_quantity_unit"] == "tonnes"
    assert basmati["export_quantity"] == 6065456.0
    assert basmati["export_quantity_unit"] == "tonnes"

    # Export values
    assert non_basmati["export_value"] == 6528000.0
    assert non_basmati["export_value_currency"] == "USD"
    assert basmati["export_value"] == 5944000.0

    # Coefficients and calculated volumes
    # Rice coefficient: green=1146, blue=341, grey=187
    assert non_basmati["green_water_coefficient"] == 1146.0
    assert non_basmati["blue_water_coefficient"] == 341.0
    assert non_basmati["grey_water_coefficient"] == 187.0
    assert non_basmati["estimated_green_water"] == 14128955.0 * 1146.0
    assert non_basmati["estimated_blue_water"] == 14128955.0 * 341.0
    assert non_basmati["estimated_grey_water"] == 14128955.0 * 187.0
    assert non_basmati["total_water_footprint"] == (14128955.0 * 1146.0) + (14128955.0 * 341.0) + (14128955.0 * 187.0)

    # Scientific caveats & methodology preserved
    assert any("theoretical assimilation/dilution" in lim for lim in non_basmati["limitations"])
    assert any("published global historical estimates" in lim for lim in non_basmati["limitations"])
    assert any("cannot be attributed to a specific state or district aquifer" in lim for lim in non_basmati["limitations"])

def test_wheat_exports_calculation_with_real_data():
    client = TestClient(app)
    response = client.get("/api/v1/exports/ledger", params={
        "crop": "wheat",
        "financial_year": "2024-25",
        "water_component": "all"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 1
    record = data["results"][0]
    assert record["crop"] == "wheat"
    assert record["export_quantity"] == 3566.0
    assert record["export_quantity_unit"] == "tonnes"
    # Wheat coefficients: green=1277, blue=342, grey=207
    assert record["green_water_coefficient"] == 1277.0
    assert record["blue_water_coefficient"] == 342.0
    assert record["grey_water_coefficient"] == 207.0
    assert record["estimated_green_water"] == 3566.0 * 1277.0
    assert record["estimated_blue_water"] == 3566.0 * 342.0
    assert record["estimated_grey_water"] == 3566.0 * 207.0

def test_water_component_specific_views():
    client = TestClient(app)

    # Green-only view
    resp_green = client.get("/api/v1/exports/ledger", params={
        "crop": "wheat", "financial_year": "2024-25", "water_component": "green"
    })
    assert resp_green.status_code == 200
    res_g = resp_green.json()["results"][0]
    assert res_g["estimated_green_water"] is not None
    assert res_g["estimated_blue_water"] is None
    assert res_g["estimated_grey_water"] is None

    # Blue-only view
    resp_blue = client.get("/api/v1/exports/ledger", params={
        "crop": "wheat", "financial_year": "2024-25", "water_component": "blue"
    })
    assert resp_blue.status_code == 200
    res_b = resp_blue.json()["results"][0]
    assert res_b["estimated_blue_water"] is not None
    assert res_b["estimated_green_water"] is None
    assert res_b["estimated_grey_water"] is None

    # Grey-only view
    resp_grey = client.get("/api/v1/exports/ledger", params={
        "crop": "wheat", "financial_year": "2024-25", "water_component": "grey"
    })
    assert resp_grey.status_code == 200
    res_gr = resp_grey.json()["results"][0]
    assert res_gr["estimated_grey_water"] is not None
    assert res_gr["estimated_green_water"] is None
    assert res_gr["estimated_blue_water"] is None

def test_unsupported_financial_year_returns_empty_gracefully():
    client = TestClient(app)
    response = client.get("/api/v1/exports/ledger", params={
        "crop": "rice",
        "financial_year": "2020-21",
        "water_component": "all"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["results"] == []
    assert "2024-25" in data["message"]

def test_invalid_crop_returns_400_validation_error():
    client = TestClient(app)
    response = client.get("/api/v1/exports/ledger", params={
        "crop": "nonexistent_crop",
        "financial_year": "2024-25"
    })
    assert response.status_code == 400
    data = response.json()
    assert "Unsupported commodity" in data["detail"]
