#!/usr/bin/env python3
"""
Development server startup for JunkStop
Starts FastAPI backend on port 8000
"""

import uvicorn
import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

if __name__ == "__main__":
    # Set environment variables for development
    os.environ.setdefault("JWT_SECRET_KEY", "junkstop-dev-secret-key")
    os.environ.setdefault("SUPABASE_URL", "")  # Will use local fallback
    os.environ.setdefault("SUPABASE_KEY", "")  # Will use local fallback
    
    # Import and run the FastAPI app
    from apps.backend.main import app
    
    print("Starting JunkStop FastAPI backend...")
    print("Backend: http://0.0.0.0:8000")
    print("API Docs: http://0.0.0.0:8000/docs")
    print("Frontend should run on port 5000")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )