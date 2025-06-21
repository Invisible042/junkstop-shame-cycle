#!/usr/bin/env python3
"""
FastAPI Backend Server for JunkStop
Run this script to start the Python backend server
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Set environment variables
    os.environ.setdefault("JWT_SECRET_KEY", "junkstop-secret-key-change-in-production")
    
    # Import and run the FastAPI app
    from apps.backend.main import app
    
    print("Starting JunkStop FastAPI backend server...")
    print("Backend will run on http://0.0.0.0:8000")
    print("API documentation available at http://0.0.0.0:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )