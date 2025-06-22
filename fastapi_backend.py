#!/usr/bin/env python3
"""
FastAPI Backend Server for JunkStop - Standalone version
Runs on port 8000 while Node.js serves the frontend on port 5000
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

# Set working directory
os.chdir(str(backend_dir))

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from datetime import datetime, timedelta
from typing import List, Optional
import bcrypt
import jwt
from postgres_client import PostgreSQLClient

# FastAPI app
app = FastAPI(title="JunkStop API", description="Junk Food Accountability App API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database client
db_client = PostgreSQLClient()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "JunkStop FastAPI backend is running"}

@app.post("/api/auth/login")
async def login(email: str = Form(), password: str = Form()):
    try:
        # Get user from database
        users = db_client.execute_query(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )
        
        if not users:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = users[0]
        
        # Verify password (demo user has password "password")
        if email == "demo@junkstop.com" and password == "password":
            # Create access token
            access_token = create_access_token(data={"sub": str(user["id"])})
            
            return {
                "id": user["id"],
                "email": user["email"],
                "username": user["username"],
                "streak_count": user["streak_count"],
                "best_streak": user["best_streak"],
                "access_token": access_token,
                "token_type": "bearer"
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/register")
async def register(
    email: str = Form(),
    username: str = Form(),
    password: str = Form()
):
    try:
        # Check if user exists
        existing_users = db_client.execute_query(
            "SELECT * FROM users WHERE email = %s OR username = %s",
            (email, username)
        )
        
        if existing_users:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        user = db_client.execute_insert(
            """
            INSERT INTO users (email, username, password_hash, streak_count, best_streak, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (email, username, password_hash, 0, 0, datetime.utcnow())
        )
        
        if not user:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user["id"])})
        
        return {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "streak_count": user["streak_count"],
            "best_streak": user["best_streak"],
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        print(f"Register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting JunkStop FastAPI backend on port 8000...")
    print("📱 Demo user: demo@junkstop.com / password")
    print("🌐 Node.js frontend available on port 5000")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )