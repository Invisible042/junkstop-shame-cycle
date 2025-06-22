#!/usr/bin/env python3
"""
FastAPI Backend Server for JunkStop
Run this script to start the Python backend server
"""
import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

import uvicorn
from main import app

if __name__ == "__main__":
    print("Starting JunkStop FastAPI backend server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )