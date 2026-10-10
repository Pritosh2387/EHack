# Water Shadow Analytics Service

A comprehensive ML and analytics engine for analyzing agricultural water footprints, crop water usage, and resource optimization in India's agricultural sector.

## Overview

This service provides RESTful APIs for:
- Agricultural export water footprint analysis
- Regional crop production statistics
- Groundwater assessment data
- Crop shift scenario simulation
- Resource optimization for crop allocation
- Sensitivity analysis and explainability
- Decision receipt generation

## Features

- **Export Analytics**: Calculate water footprints associated with agricultural exports
- **Regional Analysis**: Access crop production and groundwater data by region
- **Scenario Modeling**: Simulate impacts of shifting from one crop to another
- **Optimization**: Find optimal crop allocations to minimize water usage
- **Explainability**: Understand how results are calculated
- **Audit Trail**: Generate detailed receipts for all analyses
- **Scientific Integrity**: Tracks provenance (OBSERVED, PUBLISHED, INFERRED) of all data

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
4. (Optional) Edit `.env` to configure paths and settings

## Running the Service

## Running Backend and Frontend Simultaneously

To start **both** the FastAPI analytics engine and the React Vite frontend at the same time:

```bash
npm start
# or alternatively:
./start.sh
```

This single command:
1. Activates the Python virtual environment and launches the FastAPI service on `http://localhost:8000`.
2. Starts the React Vite frontend development server on `http://localhost:5173`.
3. Handles process termination gracefully — pressing `Ctrl+C` cleanly stops both backend and frontend servers together.

---

## Running Services Individually

### Frontend Only:
```bash
npm run frontend
# or: cd frontend && npm run dev
```

### Backend Only:
```bash
npm run backend
# or: source .venv/bin/activate && uvicorn ml_service.app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing & Building:
```bash
npm test      # Runs frontend test suites
npm run build # Generates production bundle in frontend/dist
```

## API Endpoints

### Health
- `GET /health` - Service health check

### Metadata
- `GET /api/v1/metadata` - Available datasets, crops, regions, and analysis types

### Data Status
- `GET /api/v1/data-status` - Dataset availability and system readiness

### Exports
- `GET /api/v1/exports/ledger` - Export-associated water footprint estimates
  - Parameters: `crop`, `financial_year`, `water_component`

### Regions
- `GET /api/v1/regions/crop-production` - Regional crop production statistics
  - Parameters: `state`, `district`, `crop`, `year`
- `GET /api/v1/regions/groundwater-stress` - Groundwater assessment data
  - Parameters: `state`, `district`, `category`, `year`
- `GET /api/v1/regions/overview` - Combined regional overview
  - Parameters: `state`, `year`

### Scenarios
- `POST /api/v1/scenarios/crop-shift` - Crop shift scenario simulation
  - Body: `region`, `baseline_crop`, `alternative_crop`, `area_hectares`, `reference_year`

### Optimization
- `POST /api/v1/optimization/crop-allocation` - Resource optimization
  - Body: `region`, `objective`, `time_period`, `constraints`

### Analysis
- `POST /api/v1/analysis/sensitivity` - Sensitivity analysis
  - Body: `analysis_type`, `parameter_to_vary`, `baseline_value`, `variation_percent`, `steps`
- `POST /api/v1/analysis/explain` - Explain analysis results
  - Body: `analysis_type`, `analysis_id`, `parameters`

### Receipts
- `POST /api/v1/receipts/` - Generate decision receipt
  - Body: `analysis_type`, `parameters`, `result_data`

## Example Usage

### Check Service Health
```bash
curl http://localhost:8000/health
```

### Get Export Water Footprint for Rice
```bash
curl "http://localhost:8000/api/v1/exports/ledger?crop=rice&financial_year=2020-21&water_component=all"
```

### Simulate Crop Shift from Rice to Wheat
```bash
curl -X POST http://localhost:8000/api/v1/scenarios/crop-shift \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Punjab",
    "baseline_crop": "rice",
    "alternative_crop": "wheat",
    "area_hectares": 100.0,
    "reference_year": "2020-21"
  }'
```

### Optimize Crop Allocation
```bash
curl -X POST http://localhost:8000/api/v1/optimization/crop-allocation \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Punjab",
    "objective": "minimize_blue_water",
    "time_period": "2020-21"
  }'
```

## Data Sources

The service uses and references the following data sources:
- **Agricultural Export Statistics**: Ministry of Commerce and Industry, TradeStat
- **Crop Production Statistics**: Ministry of Agriculture and Farmers Welfare, Government of India
- **Groundwater Assessment**: Central Ground Water Board (CGWB), Government of India
- **Water Footprint Coefficients**: Mekonnen and Hoekstra (2011), Water Footprint Network

## Scientific Integrity

All results include provenance tracking:
- **OBSERVED**: Directly reported by official sources
- **PUBLISHED**: Research-derived coefficients and estimates
- **INFERRED**: Calculated using documented methods

The service maintains clear distinctions between:
- Green water (consumed rainwater)
- Blue water (consumed surface and groundwater)
- Grey water (pollution assimilation indicator)

## Development

To run tests:
```bash
pip install -r requirements.txt
pytest ml_service/tests -v
```

## License

This project is part of the Water Shadow initiative for sustainable agricultural water management in India.
