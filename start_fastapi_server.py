#!/usr/bin/env python3
"""
Start FastAPI backend server for JunkStop
"""
import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.join(os.getcwd(), "apps", "backend")
sys.path.insert(0, backend_dir)

# Change working directory to backend
os.chdir(backend_dir)

try:
    from main import app
    import uvicorn
    
    print("Starting JunkStop FastAPI backend on port 5000...")
    print("Demo user credentials: demo@junkstop.com / password")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        reload=False,
        log_level="info"
    )
except Exception as e:
    print(f"Failed to start FastAPI server: {e}")
    import traceback
    traceback.print_exc()