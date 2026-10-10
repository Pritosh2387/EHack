#!/usr/bin/env bash

# ==============================================================================
# Water Shadow — Full-Stack Runner
# Launches FastAPI Backend & React Vite Frontend concurrently with unified shutdown
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Terminal colors
GREEN='\033[0;32m'
TEAL='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${TEAL}"
echo "============================================================"
echo "          💧 WATER SHADOW INTELLIGENCE PLATFORM             "
echo "============================================================"
echo -e "${NC}"

# 1. Setup & verify Python environment
if [ -d ".venv" ]; then
    echo -e "${GREEN}[Backend]${NC} Activating Python virtual environment (.venv)..."
    source .venv/bin/activate
elif command -v python3 &> /dev/null; then
    echo -e "${YELLOW}[Backend]${NC} .venv not found, attempting to create one..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi

export PYTHONPATH="$PROJECT_ROOT"

# 2. Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}[Frontend]${NC} node_modules not found in frontend. Running npm install..."
    (cd frontend && npm install)
fi

# Ensure frontend .env exists
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}[Frontend]${NC} Creating frontend/.env from .env.example..."
    cp frontend/.env.example frontend/.env
fi

# Clean up any child processes on exit (Ctrl+C / SIGINT / SIGTERM)
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down Water Shadow services...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo -e "${GREEN}Services stopped successfully.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 3. Start Backend FastAPI
echo -e "${GREEN}[Backend]${NC} Launching FastAPI Analytics Service on http://127.0.0.1:8000..."
uvicorn ml_service.app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Brief pause to allow FastAPI startup
sleep 1.5

# 4. Start Frontend Vite
echo -e "${TEAL}[Frontend]${NC} Launching React Vite Dev Server on http://localhost:5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓ All services running!${NC}"
echo -e "  - Frontend UI:   ${TEAL}http://localhost:5173${NC}"
echo -e "  - Backend API:   ${GREEN}http://localhost:8000${NC}"
echo -e "  - API Swagger:   ${GREEN}http://localhost:8000/docs${NC}"
echo -e "Press ${YELLOW}Ctrl+C${NC} anytime to stop both services."
echo ""

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
