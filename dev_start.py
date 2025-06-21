#!/usr/bin/env python3
"""
Development startup script for JunkStop
Starts both FastAPI backend and React frontend
"""

import subprocess
import sys
import time
import threading
import os
from pathlib import Path

def start_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting FastAPI backend on port 8000...")
    
    # Add the current directory to Python path
    env = os.environ.copy()
    env['PYTHONPATH'] = str(Path(__file__).parent)
    env['JWT_SECRET_KEY'] = 'junkstop-dev-secret-key'
    
    try:
        subprocess.run([
            sys.executable, "run_backend.py"
        ], env=env, cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped")
    except Exception as e:
        print(f"❌ Backend error: {e}")

def start_frontend():
    """Start the React frontend server"""
    print("⚛️  Starting React frontend on port 5000...")
    time.sleep(2)  # Give backend time to start
    
    try:
        subprocess.run([
            "npm", "run", "dev"
        ], cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n🛑 Frontend stopped")
    except Exception as e:
        print(f"❌ Frontend error: {e}")

def main():
    print("🏃 Starting JunkStop development servers...")
    print("📱 Frontend: http://localhost:5000")
    print("🔧 Backend API: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop all servers\n")
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Start frontend in main thread
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all servers...")

if __name__ == "__main__":
    main()