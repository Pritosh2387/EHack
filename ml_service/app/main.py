from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from ml_service.app.api.routes import health, metadata, data_status, exports, regions, scenarios, optimization, analysis, receipts

app = FastAPI(
    title="Water Shadow Analytics Service",
    description="ML and Analytics Engine for Water Shadow - Agricultural Water Footprint Analysis",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(metadata.router, prefix="/api/v1", tags=["metadata"])
app.include_router(data_status.router, prefix="/api/v1", tags=["data-status"])
app.include_router(exports.router, prefix="/api/v1/exports", tags=["exports"])
app.include_router(regions.router, prefix="/api/v1/regions", tags=["regions"])
app.include_router(scenarios.router, prefix="/api/v1/scenarios", tags=["scenarios"])
app.include_router(optimization.router, prefix="/api/v1/optimization", tags=["optimization"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(receipts.router, prefix="/api/v1/receipts", tags=["receipts"])

@app.get("/")
async def root():
    return {
        "message": "Water Shadow Analytics Service",
        "version": "0.1.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }

if __name__ == "__main__":
    uvicorn.run("ml_service.app.main:app", host="0.0.0.0", port=8000, reload=True)