from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from datetime import datetime, timedelta
from typing import List, Optional
import base64
from PIL import Image
import io
from dotenv import load_dotenv

from apps.backend.models import *
from apps.backend.database import get_supabase_client, create_tables
from apps.backend.auth import get_current_user, create_access_token, verify_password, get_password_hash
from apps.backend.storage import upload_image, delete_image
from apps.backend.ai_coach import generate_motivation, analyze_patterns, estimate_calories

load_dotenv()

app = FastAPI(title="JunkStop API", description="Junk Food Accountability App API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    await create_tables()

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    supabase = get_supabase_client()
    
    try:
        # Check if user already exists
        existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user_dict = {
            "email": user_data.email,
            "username": user_data.username,
            "password_hash": hashed_password,
            "streak_count": 0,
            "best_streak": 0,
            "total_guilt_score": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("users").insert(user_dict).execute()
        user = result.data[0]
        
        # Generate access token
        access_token = create_access_token(data={"sub": user["email"]})
        
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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    supabase = get_supabase_client()
    
    try:
        # Get user by email
        result = supabase.table("users").select("*").eq("email", login_data.email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = result.data[0]
        
        # Verify password
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate access token
        access_token = create_access_token(data={"sub": user["email"]})
        
        return {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "streak_count": user["streak_count"],
            "best_streak": user["best_streak"],
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User endpoints
@app.get("/api/user/profile", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    
    try:
        # Get user stats
        user_result = supabase.table("users").select("*").eq("id", current_user["id"]).execute()
        user = user_result.data[0]
        
        # Get recent logs for calculations
        logs_result = supabase.table("junk_food_logs").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(50).execute()
        logs = logs_result.data
        
        # Calculate stats
        total_saved = sum([log.get("estimated_cost", 0) for log in logs])
        avg_guilt_score = sum([log.get("guilt_rating", 0) for log in logs]) / len(logs) if logs else 0
        
        return {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "streak_count": user["streak_count"],
            "best_streak": user["best_streak"],
            "total_saved": total_saved,
            "avg_guilt_score": round(avg_guilt_score, 1),
            "total_logs": len(logs),
            "created_at": user["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Junk food logging endpoints
@app.post("/api/logs", response_model=JunkFoodLogResponse)
async def create_log(
    photo: UploadFile = File(...),
    food_type: str = Form(...),
    guilt_rating: int = Form(...),
    regret_rating: int = Form(...),
    estimated_cost: Optional[float] = Form(None),
    location: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    
    try:
        # Upload photo
        photo_url = await upload_image(photo, current_user["id"])
        
        # Estimate calories using AI
        estimated_calories = await estimate_calories(food_type)
        
        # Create log entry
        log_dict = {
            "user_id": current_user["id"],
            "photo_url": photo_url,
            "food_type": food_type,
            "guilt_rating": guilt_rating,
            "regret_rating": regret_rating,
            "estimated_cost": estimated_cost or 0,
            "estimated_calories": estimated_calories,
            "location": location,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("junk_food_logs").insert(log_dict).execute()
        log = result.data[0]
        
        # Reset user streak
        supabase.table("users").update({"streak_count": 0}).eq("id", current_user["id"]).execute()
        
        # Generate AI motivation
        motivation = await generate_motivation(current_user["id"], guilt_rating, regret_rating)
        
        return {
            "id": log["id"],
            "photo_url": log["photo_url"],
            "food_type": log["food_type"],
            "guilt_rating": log["guilt_rating"],
            "regret_rating": log["regret_rating"],
            "estimated_cost": log["estimated_cost"],
            "estimated_calories": log["estimated_calories"],
            "location": log["location"],
            "created_at": log["created_at"],
            "ai_motivation": motivation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs", response_model=List[JunkFoodLogResponse])
async def get_user_logs(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("junk_food_logs").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return [
            {
                "id": log["id"],
                "photo_url": log["photo_url"],
                "food_type": log["food_type"],
                "guilt_rating": log["guilt_rating"],
                "regret_rating": log["regret_rating"],
                "estimated_cost": log["estimated_cost"],
                "estimated_calories": log["estimated_calories"],
                "location": log["location"],
                "created_at": log["created_at"]
            }
            for log in result.data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Streak management
@app.post("/api/streak/increment")
async def increment_streak(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    
    try:
        # Get current user data
        user_result = supabase.table("users").select("*").eq("id", current_user["id"]).execute()
        user = user_result.data[0]
        
        new_streak = user["streak_count"] + 1
        best_streak = max(user["best_streak"], new_streak)
        
        # Update user
        supabase.table("users").update({
            "streak_count": new_streak,
            "best_streak": best_streak
        }).eq("id", current_user["id"]).execute()
        
        return {
            "streak_count": new_streak,
            "best_streak": best_streak,
            "is_new_record": new_streak > user["best_streak"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Progress analytics
@app.get("/api/analytics/weekly")
async def get_weekly_analytics(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    
    try:
        # Get logs from last 7 days
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        result = supabase.table("junk_food_logs").select("*").eq("user_id", current_user["id"]).gte("created_at", week_ago).execute()
        
        logs = result.data
        
        if not logs:
            return {
                "total_logs": 0,
                "avg_guilt_score": 0,
                "avg_regret_score": 0,
                "total_cost": 0,
                "total_calories": 0,
                "daily_breakdown": []
            }
        
        # Calculate stats
        total_logs = len(logs)
        avg_guilt = sum([log["guilt_rating"] for log in logs]) / total_logs
        avg_regret = sum([log["regret_rating"] for log in logs]) / total_logs
        total_cost = sum([log.get("estimated_cost", 0) for log in logs])
        total_calories = sum([log.get("estimated_calories", 0) for log in logs])
        
        # Daily breakdown
        daily_stats = {}
        for log in logs:
            date = log["created_at"][:10]  # Get date only
            if date not in daily_stats:
                daily_stats[date] = {"count": 0, "guilt": 0, "regret": 0, "cost": 0, "calories": 0}
            
            daily_stats[date]["count"] += 1
            daily_stats[date]["guilt"] += log["guilt_rating"]
            daily_stats[date]["regret"] += log["regret_rating"]
            daily_stats[date]["cost"] += log.get("estimated_cost", 0)
            daily_stats[date]["calories"] += log.get("estimated_calories", 0)
        
        daily_breakdown = [
            {
                "date": date,
                "count": stats["count"],
                "avg_guilt": stats["guilt"] / stats["count"],
                "avg_regret": stats["regret"] / stats["count"],
                "total_cost": stats["cost"],
                "total_calories": stats["calories"]
            }
            for date, stats in daily_stats.items()
        ]
        
        return {
            "total_logs": total_logs,
            "avg_guilt_score": round(avg_guilt, 1),
            "avg_regret_score": round(avg_regret, 1),
            "total_cost": round(total_cost, 2),
            "total_calories": total_calories,
            "daily_breakdown": sorted(daily_breakdown, key=lambda x: x["date"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Coach endpoints
@app.get("/api/ai/daily-insight")
async def get_daily_insight(current_user: dict = Depends(get_current_user)):
    try:
        insight = await analyze_patterns(current_user["id"])
        return {"insight": insight, "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat_with_ai(message: ChatMessage, current_user: dict = Depends(get_current_user)):
    try:
        guilt_rating = message.guilt_level if message.guilt_level is not None else 5
        regret_rating = message.regret_level if message.regret_level is not None else 5
        response = await generate_motivation(current_user["id"], guilt_rating, regret_rating, message.message)
        return {"response": response, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Community endpoints
@app.get("/api/community/posts")
async def get_community_posts(limit: int = 20, offset: int = 0):
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("community_posts").select("*").eq("is_anonymous", True).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return [
            {
                "id": post["id"],
                "content": post["content"],
                "photo_url": post.get("photo_url"),
                "likes_count": post.get("likes_count", 0),
                "created_at": post["created_at"]
            }
            for post in result.data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/community/posts")
async def create_community_post(
    post_data: CommunityPostCreate,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()
    
    try:
        post_dict = {
            "user_id": current_user["id"],
            "content": post_data.content,
            "photo_url": post_data.photo_url,
            "is_anonymous": post_data.is_anonymous,
            "likes_count": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("community_posts").insert(post_dict).execute()
        post = result.data[0]
        
        return {
            "id": post["id"],
            "content": post["content"],
            "photo_url": post.get("photo_url"),
            "likes_count": post["likes_count"],
            "created_at": post["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)