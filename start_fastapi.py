#!/usr/bin/env python3
"""
Start FastAPI backend server for JunkStop
"""
import uvicorn
import os
import sys
import asyncio

async def main():
    # Add the current directory to Python path
    sys.path.insert(0, os.getcwd())
    
    # Import and run the FastAPI app
    from apps.backend.main import app
    
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        access_log=True
    )
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())