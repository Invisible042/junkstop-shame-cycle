#!/usr/bin/env python3
"""
JunkStop FastAPI Backend - Working Version
"""
from fastapi import FastAPI, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta
import jwt
import bcrypt
from typing import Optional

app = FastAPI(title="JunkStop API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = "junkstop-secret-key"
ALGORITHM = "HS256"

def get_db_connection():
    try:
        return psycopg2.connect(
            os.getenv("DATABASE_URL"),
            cursor_factory=psycopg2.extras.RealDictCursor
        )
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = %s", (int(user_id),))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return dict(user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

@app.get("/")
async def root():
    return {"message": "JunkStop FastAPI Backend", "status": "running"}

@app.get("/api/health")
async def health_check():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return {
            "status": "ok", 
            "backend": "FastAPI", 
            "database": "connected",
            "demo_user": "demo@junkstop.com / password"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/auth/login")
async def login(email: str = Form(), password: str = Form()):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Demo user check (password: "password")
        if email == "demo@junkstop.com" and password == "password":
            access_token = create_access_token(data={"sub": str(user["id"])})
            
            cur.close()
            conn.close()
            
            return {
                "id": user["id"],
                "email": user["email"],
                "username": user["username"],
                "streak_count": user["streak_count"],
                "best_streak": user["best_streak"],
                "access_token": access_token,
                "token_type": "bearer"
            }
        
        # For other users, verify hashed password
        if user["password_hash"] and bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
            access_token = create_access_token(data={"sub": str(user["id"])})
            
            cur.close()
            conn.close()
            
            return {
                "id": user["id"],
                "email": user["email"],
                "username": user["username"],
                "streak_count": user["streak_count"],
                "best_streak": user["best_streak"],
                "access_token": access_token,
                "token_type": "bearer"
            }
        
        cur.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "username": current_user["username"],
        "streak_count": current_user["streak_count"],
        "best_streak": current_user["best_streak"],
        "total_saved": 0.0,  # Calculate from logs
        "avg_guilt_score": 0.0,  # Calculate from logs
        "total_logs": 0,  # Calculate from logs
        "created_at": str(current_user["created_at"])
    }

@app.get("/api/logs")
async def get_user_logs(current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM junk_food_logs WHERE user_id = %s ORDER BY created_at DESC LIMIT 20",
            (current_user["id"],)
        )
        logs = cur.fetchall()
        cur.close()
        conn.close()
        
        return [dict(log) for log in logs]
    except Exception as e:
        print(f"Get logs error: {e}")
        return []

if __name__ == "__main__":
    print("🚀 Starting JunkStop FastAPI Backend")
    print("📍 Server: http://0.0.0.0:8000")
    print("👤 Demo user: demo@junkstop.com / password")
    print("🌐 Frontend: http://localhost:5000")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )