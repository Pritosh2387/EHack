import os
import pytest
import pandas as pd
from ml_service.app.data_loader import DataLoader

FIXTURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "fixtures"))

@pytest.fixture
def test_loader():
    return DataLoader(data_dir=FIXTURES_DIR)

def test_load_agricultural_exports(test_loader):
    df, success, errors = test_loader.load_agricultural_exports()
    assert success, f"Errors: {errors}"
    assert not df.empty
    assert df.iloc[0]["commodity_description"] == "rice"

def test_load_crop_water_footprint(test_loader):
    df, success, errors = test_loader.load_crop_water_footprint()
    assert success, f"Errors: {errors}"
    assert not df.empty
    assert df.iloc[0]["crop_or_product"] == "rice"

def test_load_crop_production(test_loader):
    df, success, errors = test_loader.load_crop_production()
    assert success, f"Errors: {errors}"
    assert not df.empty
    assert df.iloc[0]["state"] == "Punjab"

def test_load_groundwater_assessment(test_loader):
    df, success, errors = test_loader.load_groundwater_assessment()
    assert success, f"Errors: {errors}"
    assert not df.empty
    assert df.iloc[0]["category"] == "Safe"
