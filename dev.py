#!/usr/bin/env python3
"""
JunkStop Monorepo Development Script
Run from root directory to start both backend and mobile development
"""

import subprocess
import sys
import os
import time
import signal
from threading import Thread

def run_backend():
    """Start the FastAPI backend server"""
    print("🐍 Starting FastAPI backend on port 8000...")
    os.chdir("apps/backend")
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", "main:app", 
            "--host", "0.0.0.0", "--port", "8000", "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    finally:
        os.chdir("../..")

def run_mobile():
    """Start the React Native mobile app"""
    print("📱 Starting React Native mobile app...")
    os.chdir("mobile")
    try:
        subprocess.run(["npm", "start"], check=True)
    except subprocess.CalledProcessError:
        print("📦 Installing mobile dependencies first...")
        subprocess.run(["npm", "install"], check=True)
        subprocess.run(["npm", "start"])
    except KeyboardInterrupt:
        print("\n🛑 Mobile app stopped")
    finally:
        os.chdir("..")

def install_dependencies():
    """Install all dependencies for the monorepo"""
    print("📦 Installing dependencies...")
    
    # Install mobile dependencies
    print("Installing mobile dependencies...")
    os.chdir("mobile")
    subprocess.run(["npm", "install"], check=True)
    os.chdir("..")
    
    # Install backend dependencies (already installed via packager)
    print("✅ Backend dependencies already installed")
    
    print("✅ All dependencies installed!")

def main():
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "install":
            install_dependencies()
            return
        elif command == "backend":
            run_backend()
            return
        elif command == "mobile":
            run_mobile()
            return
        elif command == "help":
            print("""
JunkStop Development Commands:
  python dev.py            - Start both backend and mobile (default)
  python dev.py install    - Install all dependencies
  python dev.py backend    - Start only backend
  python dev.py mobile     - Start only mobile
  python dev.py help       - Show this help
            """)
            return
    
    # Default: start both backend and mobile
    print("🚀 Starting JunkStop full development environment")
    print("Backend: http://localhost:8000")
    print("Mobile: Expo will show QR code for mobile testing")
    print("Press Ctrl+C to stop all services\n")
    
    # Start backend in background thread
    backend_thread = Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(3)
    
    # Start mobile (blocking)
    try:
        run_mobile()
    except KeyboardInterrupt:
        print("\n🛑 Stopping all services...")

if __name__ == "__main__":
    main()