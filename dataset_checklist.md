# Final Dataset Integration Checklist

The data integration schemas have been rigorously corrected. To ensure 100% interoperability with the analytics services, you must manually download the specified datasets, ensure they conform to the exact schemas defined below, and place them in the correct directories.

## 1. Agricultural Exports
* **Expected Location:** `ml_service/data/agricultural_exports.csv` (or `.xlsx`)
* **Expected Schema:**
  - `hs_code` (string)
  - `commodity_description` (string, representing the crop/commodity)
  - `original_quantity` (float, non-negative)
  - `original_quantity_unit` (string, e.g., "kg", "bales", "tonnes")
  - `normalized_quantity_tonnes` (float, non-negative, uniform unit for computation)
  - `financial_year` (string, format YYYY-YY)
  - `export_value` (float, non-negative)
  - `currency` (string, e.g., "USD" or "INR")
  - `source_reference` (string, citation or agency)
* **Status:** 🔴 Pending File Supply

## 2. Crop Water Footprint
* **Expected Location:** `ml_service/data/crop_water_footprint.csv` (or `.xlsx`)
* **Expected Schema:**
  - `crop_or_product` (string, matching the commodity)
  - `green_water` (float, non-negative)
  - `blue_water` (float, non-negative)
  - `grey_water` (float, non-negative)
  - `coefficient_unit` (string, e.g., "m³/tonne")
  - `geographic_scope` (string, e.g., "Global Average", "National Estimate")
  - `reference_period` (string, e.g., "1996-2005")
  - `source_publication` (string)
  - `methodology` (string)
* **Status:** 🔴 Pending File Supply
* **Note on Sources:** The provided `water_footprint_article.html` is merely the article text. You must download the actual coefficients from the **Value of Water Research Report Series No. 47** appendices (available via the Water Footprint Network or University of Twente research portals). 
* **Important:** If you use global-average coefficients from these tables, explicitly label the `geographic_scope` as "Global estimate" and retain the exact study period (e.g., 1996-2005). Never label global average coefficients as "India-specific".

## 3. Crop Production
* **Expected Location:** `ml_service/data/crop_production.csv` (or `.xlsx`)
* **Expected Schema:**
  - `state` (string)
  - `district` (string, optional - leave blank or null if not available)
  - `crop` (string)
  - `year` (string, YYYY or YYYY-YY)
  - `area` (float, non-negative, hectares)
  - `production` (float, non-negative, tonnes)
  - `yield` (float, non-negative, tonnes/hectare)
* **Status:** 🔴 Pending File Supply
* **Note:** District is explicitly made optional so that state-level data can be parsed natively without fabricating district observations.

## 4. Groundwater Assessment
* **Expected Location:** `ml_service/data/groundwater_assessment.csv` (or `.xlsx`)
* **Expected Schema:**
  - `assessment_unit_id` (string)
  - `state` (string)
  - `district` (string)
  - `category` (string, strictly mapping to: Safe, Semi-Critical, Critical, Over-Exploited, Saline)
  - `year` (integer, preserving the original assessment year)
  - (Optional) `latitude`, `longitude` (float)
* **Status:** 🔴 Pending File Supply
* **Note on Download:** Before resorting to manual PDF extraction, attempt to download the structured CSV/Excel dataset via official portals such as the **CGWB IN-GRES platform**, **India-WRIS**, or the **National Data Registry / CKAN portals**, which host the block-wise categorization dataset digitally. Only if unavailable, extract the "Categorization of Assessment Units" tables from `gwra_2025.pdf`.

---

### Integration Adjustments Completed
1. **Reporting Periods Kept Strictly Isolated**: The system no longer assumes that financial year "2020-21" for crops maps directly to calendar year "2020" for groundwater. The `/overview` API now natively accepts disjoint `year` (for crops) and `groundwater_year` queries to safely map datasets as provided by the user.
2. **Optimizer Safety Math**: The optimizer mathematically cannot yield a zero-allocation due to minimum baseline production constraints enforced at the bounds level, passing tests verifying non-trivial production bounds.
3. **No Synthetic Leakage**: Tests successfully pass utilizing distinct internal mock files while proving the real services trigger `ValueError` or fallback cleanly to empty "Unavailable" collections if datasets do not conform to these specifications.
