# Water Shadow Analytics Service - Amazon ECS Express Mode
FROM python:3.11-slim

# Prevent Python from buffering stdout/stderr and writing .pyc files
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8080

WORKDIR /app

# Install dependencies from root requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy complete backend ml_service package including all four CSV datasets in ml_service/data/
COPY ml_service/ ./ml_service/

# Expose backend port
EXPOSE 8080

# Health check matching ECS /health target
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Start FastAPI via Uvicorn
CMD ["python", "-m", "uvicorn", "ml_service.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
