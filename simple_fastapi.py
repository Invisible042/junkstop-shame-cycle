#!/usr/bin/env python3
"""
Simple FastAPI Backend for JunkStop Demo
"""
from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import psycopg2
from datetime import datetime, timedelta
import jwt
import bcrypt

app = FastAPI(title="JunkStop API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

# JWT settings
SECRET_KEY = "junkstop-secret-key"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "backend": "FastAPI", "message": "JunkStop backend running"}

@app.post("/api/auth/login")
async def login(email: str = Form(), password: str = Form()):
    try:
        # Demo user authentication
        if email == "demo@junkstop.com" and password == "password":
            # Get user from database
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            result = cur.fetchone()
            
            if result:
                user_data = {
                    "id": result[0],
                    "email": result[1],
                    "username": result[2],
                    "streak_count": result[4],
                    "best_streak": result[5]
                }
                
                access_token = create_access_token(data={"sub": str(result[0])})
                
                cur.close()
                conn.close()
                
                return {
                    **user_data,
                    "access_token": access_token,
                    "token_type": "bearer"
                }
            
            cur.close()
            conn.close()
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/auth/register")
async def register(email: str = Form(), username: str = Form(), password: str = Form()):
    try:
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert new user
        cur.execute(
            "INSERT INTO users (email, username, password_hash, streak_count, best_streak, created_at) VALUES (%s, %s, %s, 0, 0, %s) RETURNING *",
            (email, username, password_hash, datetime.utcnow())
        )
        result = cur.fetchone()
        conn.commit()
        
        if result:
            user_data = {
                "id": result[0],
                "email": result[1],
                "username": result[2],
                "streak_count": result[4],
                "best_streak": result[5]
            }
            
            access_token = create_access_token(data={"sub": str(result[0])})
            
            cur.close()
            conn.close()
            
            return {
                **user_data,
                "access_token": access_token,
                "token_type": "bearer"
            }
        
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail="Failed to create user")
        
    except Exception as e:
        print(f"Register error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

if __name__ == "__main__":
    print("Starting JunkStop FastAPI backend on port 8000...")
    print("Demo user: demo@junkstop.com / password")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )