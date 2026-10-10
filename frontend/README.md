# Water Shadow — Frontend Application

Water Shadow is an environmental intelligence platform designed to reveal estimated water footprints associated with India's agricultural exports, present regional agricultural production alongside official groundwater assessment data, and evaluate alternative crop-allocation strategies.

This frontend is a React + TypeScript single-page application built with Vite, Tailwind CSS, Lucide icons, Recharts, and Leaflet, integrating seamlessly with the Water Shadow FastAPI analytics engine.

---

## Architecture & Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Build Tool**: Vite 8
- **Routing**: React Router (`react-router-dom`)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design System tokens
- **Data Fetching & Cache**: `@tanstack/react-query`
- **Charts & Maps**: Recharts & Leaflet (`react-leaflet`)
- **Icons**: `lucide-react`
- **Typography**: Inter (Google Fonts)

---

## Project Structure

```
frontend/
├── public/                # Static public assets
├── src/
│   ├── api/               # Typed HTTP client modules for all FastAPI groups
│   │   ├── client.ts      # Core fetch wrapper with base URL and error parsing
│   │   ├── health.ts      # GET /health
│   │   ├── metadata.ts    # GET /api/v1/metadata
│   │   ├── dataStatus.ts  # GET /api/v1/data-status
│   │   ├── exports.ts     # GET /api/v1/exports/ledger
│   │   ├── regions.ts     # GET /api/v1/regions/*
│   │   ├── scenarios.ts   # POST /api/v1/scenarios/crop-shift
│   │   ├── optimization.ts# POST /api/v1/optimization/crop-allocation
│   │   ├── analysis.ts    # POST /api/v1/analysis/sensitivity & explain
│   │   └── receipts.ts    # POST /api/v1/receipts/ (trailing slash)
│   ├── app/
│   │   ├── App.tsx        # React Query and Router provider root
│   │   └── routes.tsx     # Route definitions for all 9 platform pages
│   ├── components/
│   │   ├── layout/        # AppShell, Sidebar, TopBar, PageHeader
│   │   ├── charts/        # ChartCard wrapper with units and citations
│   │   ├── maps/          # RegionalMap (Leaflet with honest missing-coords fallback)
│   │   ├── forms/         # FilterPanel with query and reset handlers
│   │   ├── tables/        # DataTable and DatasetTable
│   │   └── feedback/      # MetricCard, StatusBadge, ProvenanceBadge, EmptyState,
│   │                      # LoadingState, ErrorState, SourcePanel, MethodologyPanel,
│   │                      # ScenarioComparison, OptimizationResultPanel, DecisionReceiptView
│   ├── pages/             # All 9 primary pages
│   │   ├── DashboardPage.tsx
│   │   ├── ExportFootprintPage.tsx
│   │   ├── RegionalExplorerPage.tsx
│   │   ├── CropShiftSimulatorPage.tsx
│   │   ├── ResourceOptimizationPage.tsx
│   │   ├── SensitivityAnalysisPage.tsx
│   │   ├── ExplainAnalysisPage.tsx
│   │   ├── DecisionReceiptsPage.tsx
│   │   └── DataMethodologyPage.tsx
│   ├── types/
│   │   └── api.ts         # TypeScript API contracts matching backend OpenAPI schema
│   ├── utils/
│   │   └── formatters.ts  # Canonical formatters for numbers, units, crops, dates
│   ├── index.css          # Color tokens, badge styles, and Tailwind layers
│   └── main.tsx           # React entrypoint
├── .env.example           # Environment template
├── .gitignore             # Git ignore configuration
├── package.json           # Dependencies and scripts
└── vite.config.ts         # Vite configuration with Tailwind CSS plugin
```

---

## Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Python 3.10+ (for running the backend service)

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Configure the Backend API URL
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your running FastAPI analytics engine:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Run Frontend Locally in Development
```bash
npm run dev
```
The application will start on `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
Build output is generated into the `dist/` directory.

To preview the production bundle:
```bash
npm run preview
```

### 6. Run Frontend Tests
```bash
npm test
```

---

## Running the Backend Analytics Service

To run the Water Shadow FastAPI service alongside the frontend:

```bash
# In repository root
source .venv/bin/activate
uvicorn ml_service.app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend documentation will be accessible at:
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Health: `http://localhost:8000/health`

---

## Scientific Principles & Ground Rules

1. **No Fabricated Statistics**: When datasets are not loaded into `ml_service/data`, the frontend renders an honest, informative unavailable state (`Unavailable — source data not loaded`) rather than generating synthetic sample numbers.
2. **Distinct Water Components**: Green (rainwater), Blue (irrigation / groundwater), and Grey (pollution assimilation) water volumes are never summed into misleading unified totals without component labels. Grey water is explicitly identified as an indicator of pollution assimilation.
3. **Decoupled National Exports**: National agricultural export water footprints are analyzed separately from regional aquifer abstractions; national export figures are never falsely projected onto specific district aquifers without validated tracing data.
4. **No Unsupported Causality**: Groundwater stress classifications from CGWB and regional crop production volumes from MoAFW are displayed side-by-side with explicit causal disclaimers.
5. **Traceable Decision Receipts**: Every crop-shift and optimization simulation allows generating an audit receipt via `POST /api/v1/receipts/`, complete with methodology formulation, data sources, assumptions, and limitations.

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Verify that `ml_service/app/main.py` has `CORSMiddleware` configured. In the provided backend, `allow_origins=["*"]` is active.
- Ensure the frontend request is directed to `http://127.0.0.1:8000` rather than an incorrect port or protocol.

### Connectivity Errors ("Unable to connect to Water Shadow analytics service")
- Verify that the FastAPI backend is running via `curl http://127.0.0.1:8000/health`.
- If running on a remote VM or container, ensure `VITE_API_BASE_URL` in `.env` reflects the accessible host IP or domain.

### Trailing Slash Handling on Receipts Endpoint
The FastAPI router for decision receipts defines `@router.post("/")` with route prefix `/api/v1/receipts`. The frontend client explicitly issues requests to `/api/v1/receipts/` to avoid unnecessary 307 temporary redirects.

---

## Dataset Ingestion & Remaining Backend Dependencies

The frontend is fully integrated with all 12 backend routes. As documented in `dataset_checklist.md`, full analytical execution of exports, production, and optimization requires the following datasets to be placed in `ml_service/data/`:
1. `agricultural_exports.csv` (TradeStat)
2. `crop_water_footprint.csv` (Mekonnen & Hoekstra 2011)
3. `crop_production.csv` (Ministry of Agriculture)
4. `groundwater_assessment.csv` (CGWB)

Until these source files are ingested, the frontend gracefully displays the pending file status in the Data & Methodology registry and informs users on scenario calculators.
