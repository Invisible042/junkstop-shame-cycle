#!/bin/bash
echo "Starting JunkStop FastAPI Backend..."
export PYTHONPATH="${PYTHONPATH}:."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload