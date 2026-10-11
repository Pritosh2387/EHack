# Water Shadow starter data pack

Place these four CSV files directly in `ml_service/data/`.

## Important scope and provenance notes

### agricultural_exports.csv
- Uses APEDA's official Annual Administrative Report 2024-25, section 2.6, with reported 2024-25 product-category quantities and values for Non-Basmati Rice, Basmati Rice, and Wheat.
- Quantity is in tonnes. The published USD-million values have been converted to the application's USD-thousands convention (multiply USD million by 1,000).
- APEDA categories are aggregate product categories, not a complete TradeStat 8-digit HS ledger, nor destination-country rows. The non-basmati and wheat `hs_code` labels indicate aggregation; do not interpret them as individual 8-digit codes.
- Official source: https://apeda.gov.in/sites/default/files/annual_report/APEDA_Annual_Report_English_2024_25.pdf

### crop_water_footprint.csv
- Published global-average coefficients are from Table 3 in Mekonnen & Hoekstra (2011), for the study period 1996–2005. They are global estimates, not current India-specific measurements.
- Green, blue, and grey figures are in m3/tonne. Grey water is a pollution-assimilation indicator; it is not physical water consumption or abstraction.
- `basmati rice` and `non-basmati rice` rows explicitly use the global `rice, paddy` values as proxy mappings so the app can join the APEDA rice categories. These are **inferred proxy rows, not published product-specific coefficients**, and are not adjusted for milling or product conversion. Any resulting export footprint should be called indicative, with this limitation shown. For research-grade, product-specific results, replace these proxy rows when suitable coefficients/processing conversions are available.
- Article: https://doi.org/10.5194/hess-15-1577-2011
- Appendices: https://ris.utwente.nl/ws/portalfiles/portal/59480760/Report47_WaterFootprintCrops_Vol2.pdf

### crop_production.csv
- Extracted from the Government of India DES `Agricultural Statistics at a Glance 2024-25`, Tables 2.4(b) (Rice) and 2.5(b) (Wheat).
- Includes only the major-producing states listed in those tables for FY 2023-24 and FY 2024-25. This is a useful official subset, **not full nationwide district coverage**. District is blank because source table values are state-level.
- Area has been converted from million hectares to hectares; production from million tonnes to tonnes; reported yield from kg/hectare to tonnes/hectare. Minor rounding differences between area, production, and reported yield can occur because source tables round values.
- Source portal: https://desagri.gov.in/document-report-category/agriculture-statistics-at-a-glance/

### groundwater_assessment.csv
- Contains five named assessment units in Ludhiana district from the Punjab 2022 groundwater report. All five are reported as Over-Exploited in that source.
- `assessment_unit_id` values are locally generated stable row keys based on state, district, unit name, and year because the cited table's displayed block names are used as identifiers here. They are not claimed to be official CGWB IDs. Coordinates are left blank rather than guessed.
- This is **only a five-unit Punjab subset**, not a nationwide groundwater dataset. The app or its metadata should communicate limited coverage; do not present this as national coverage or compute a national distribution from these rows.
- Source: https://www.cgwb.gov.in/old_website/GW-Assessment/GWR-2022-Reports%20State/Punjab.pdf

## Files and scope

This pack contains four schema-aligned starter CSVs. Three include official/published or source-backed values; groundwater contains only the five verified rows listed above. It is not a complete, nation-wide production data release. Do not restore the old mock CSV values: the earlier examples contained mock export records and an inconsistent crop yield.
