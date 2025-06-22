#!/usr/bin/env python3
"""
Start the existing JunkStop FastAPI backend
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

# Change to backend directory
os.chdir(str(backend_dir))

# Import and run the existing FastAPI app
from main import app
import uvicorn

if __name__ == "__main__":
    print("Starting JunkStop FastAPI backend on port 5000...")
    print("Demo user: demo@junkstop.com / password")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        reload=False,
        log_level="info"
    )