# Water Shadow Analytics Data Sets

This directory (`ml_service/data`) is where you must place your real datasets for the Water Shadow analytics service. The service explicitly separates demo data from production data, meaning it will never silently fall back to synthetic data. If the real datasets are not found or fail validation, the system will explicitly report them as unavailable.

## Required Datasets

### 1. Agricultural Exports
- **Filename**: `agricultural_exports.csv` or `agricultural_exports.xlsx`
- **Purpose**: Export analytics and footprint estimation
- **Schema**:
  - `hs_code` (string)
  - `commodity_description` (string, representing the crop/commodity)
  - `original_quantity` (float, non-negative)
  - `original_quantity_unit` (string, e.g., "kg", "bales", "tonnes")
  - `normalized_quantity_tonnes` (float, non-negative, uniform unit for computation)
  - `financial_year` (string, format YYYY-YY)
  - `export_value` (float, non-negative)
  - `currency` (string, e.g., "USD" or "INR")
  - `source_reference` (string, citation or agency)

### 2. Crop Water Footprint
- **Filename**: `crop_water_footprint.csv` or `crop_water_footprint.xlsx`
- **Purpose**: Water footprint and optimization
- **Schema**:
  - `crop_or_product` (string, matching the commodity)
  - `green_water` (float, non-negative)
  - `blue_water` (float, non-negative)
  - `grey_water` (float, non-negative)
  - `coefficient_unit` (string, e.g., "m³/tonne")
  - `geographic_scope` (string, e.g., "Global estimate", "National Estimate")
  - `reference_period` (string, e.g., "1996-2005")
  - `source_publication` (string)
  - `methodology` (string)
- **Note**: The `water_footprint_article.html` is merely the article text. You must download the actual coefficients from the **Value of Water Research Report Series No. 47** appendices (available via the Water Footprint Network or University of Twente research portals) and format them as CSV/Excel. If you use global-average coefficients, explicitly label the `geographic_scope` as "Global estimate" and retain the exact study period (e.g., 1996-2005). Never label global average coefficients as "India-specific".

### 3. Crop Production
- **Filename**: `crop_production.csv` or `crop_production.xlsx`
- **Purpose**: Regional production analysis, resource optimization, crop shift simulation
- **Schema**:
  - `state` (string)
  - `district` (string, optional - leave blank or null if not available)
  - `crop` (string)
  - `year` (string, YYYY or YYYY-YY)
  - `area` (float, non-negative, hectares)
  - `production` (float, non-negative, tonnes)
  - `yield` (float, non-negative, tonnes/hectare)

### 4. Groundwater Assessment
- **Filename**: `groundwater_assessment.csv` or `groundwater_assessment.xlsx`
- **Purpose**: Groundwater stress overview and regional integration
- **Schema**:
  - `assessment_unit_id` (string)
  - `state` (string)
  - `district` (string)
  - `category` (string, strictly mapping to: Safe, Semi-Critical, Critical, Over-Exploited, Saline)
  - `year` (integer, preserving the original assessment year)
  - (Optional) `latitude`, `longitude` (float)
- **Note**: Attempt to download the structured CSV/Excel dataset via official portals such as the **CGWB IN-GRES platform**, **India-WRIS**, or the **National Data Registry / CKAN portals**, which host the block-wise categorization dataset digitally. Only if unavailable, extract the "Categorization of Assessment Units" tables manually from `gwra_2025.pdf`.

## Validation and Loading
To ensure datasets are ingested correctly, place them directly in the `ml_service/data/` folder.
The data loader checks schemas, validates units and formats, matches crops to supported maps, and tests geographic/reporting-period structures. Only successfully validated files flag the data as available to the analytics endpoints.