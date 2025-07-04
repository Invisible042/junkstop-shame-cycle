from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Body, Request
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
from pydantic import BaseModel
from passlib.hash import bcrypt
import time

from models import *
from postgres_client import db_client
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from storage import upload_image, delete_image
from ai_coach import generate_motivation, analyze_patterns, estimate_calories

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
uploads_dir = "/tmp/uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    print("FastAPI server starting...")

# Simple in-memory rate limit store: { (user_id, endpoint): [timestamps] }
rate_limit_store = {}
RATE_LIMITS = {
    'post': (5, 60),  # max 5 posts per 60 seconds
    'reply': (10, 60),
    'like': (20, 60),
}

PROFANITY_LIST = ['badword1', 'badword2', 'shit', 'fuck']  # Add more as needed

def is_profane(text):
    return any(word in text.lower() for word in PROFANITY_LIST)

def check_rate_limit(user_id, action):
    now = time.time()
    key = (user_id, action)
    max_calls, per_seconds = RATE_LIMITS.get(action, (10, 60))
    timestamps = rate_limit_store.get(key, [])
    # Remove old timestamps
    timestamps = [t for t in timestamps if now - t < per_seconds]
    if len(timestamps) >= max_calls:
        return False
    timestamps.append(now)
    rate_limit_store[key] = timestamps
    return True

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "JunkStop API is running",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "health": "/health",
            "auth": "/api/auth/*",
            "user": "/api/user/*",
            "logs": "/api/logs",
            "analytics": "/api/analytics/*",
            "ai": "/api/ai/*",
            "community": "/api/community/*"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    try:
        # Check if user already exists
        existing_users = db_client.execute_query(
            "SELECT * FROM users WHERE email = %s",
            (user_data.email,)
        )
        if existing_users:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user = db_client.execute_insert(
            """
            INSERT INTO users (email, username, password_hash, streak_count, best_streak, total_guilt_score, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s) 
            RETURNING *
            """,
            (user_data.email, user_data.username, hashed_password, 0, 0, 0.0, datetime.utcnow())
        )
        
        if not user:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
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

@app.post("/api/auth/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    try:
        # Get user by email
        users = db_client.execute_query(
            "SELECT * FROM users WHERE email = %s",
            (login_data.email,)
        )
        if not users:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = users[0]
        
        # Special case for demo user
        if login_data.email == "demo@junkstop.com" and login_data.password == "password":
            # Demo user authentication
            pass
        elif not verify_password(login_data.password, user["password_hash"]):
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
    try:
        # Get user stats
        users = db_client.execute_query(
            "SELECT * FROM users WHERE id = %s",
            (current_user["id"],)
        )
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        user = users[0]
        
        # Get recent logs for calculations
        logs = db_client.execute_query(
            "SELECT * FROM junk_food_logs WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
            (current_user["id"],)
        )
        
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
            "created_at": user["created_at"].isoformat() if hasattr(user["created_at"], "isoformat") else str(user["created_at"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Junk food logging endpoints
@app.post("/api/logs", response_model=JunkFoodLogResponse)
async def create_log(
    photo: Optional[UploadFile] = File(None), 
    food_type: str = Form(...),
    guilt_rating: int = Form(...),
    regret_rating: int = Form(...),
    estimated_cost: Optional[float] = Form(None),
    location: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    
    try:
        # Debug: Log when a request is received and the photo filename
        print(f"[DEBUG] /api/logs received. Photo filename: {getattr(photo, 'filename', None)}")
        print(f"[DEBUG] About to upload image for user {current_user['id']}")

        print("hello world")
        # Upload photo
        photo_url = await upload_image(photo, current_user["id"])
        print(photo_url)
        print("working here ooo")
        # Estimate calories using AI
        estimated_calories = await estimate_calories(food_type)
        print("estimated calories", estimated_calories, "type", type(estimated_calories))
        
        # Create log entry
        log = db_client.execute_insert(
            """
            INSERT INTO junk_food_logs (user_id, photo_url, food_type, guilt_rating, regret_rating, estimated_cost, estimated_calories, location, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (current_user["id"], photo_url, food_type, guilt_rating, regret_rating, estimated_cost or 0, estimated_calories, location, datetime.utcnow())
        )
        print(log)
        if not log:
            raise HTTPException(status_code=500, detail="Failed to create log")
        
        # Reset user streak
        db_client.execute_update(
            "UPDATE users SET streak_count = 0 WHERE id = %s",
            (current_user["id"],)
        )
        # Generate AI motivation
        motivation = await generate_motivation(current_user["id"], guilt_rating, regret_rating)
        print(motivation)
        
        return {
            "id": log["id"],
            "photo_url": log["photo_url"],
            "food_type": log["food_type"],
            "guilt_rating": log["guilt_rating"],
            "regret_rating": log["regret_rating"],
            "estimated_cost": log["estimated_cost"],
            "estimated_calories": log["estimated_calories"],
            "location": log["location"],
            "created_at": log["created_at"].isoformat() if hasattr(log["created_at"], "isoformat") else str(log["created_at"]),
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
    try:
        logs = db_client.execute_query(
            "SELECT * FROM junk_food_logs WHERE user_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (current_user["id"], limit, offset)
        )
        
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
                "created_at": log["created_at"].isoformat() if hasattr(log["created_at"], "isoformat") else str(log["created_at"])
            }
            for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Streak management
@app.post("/api/streak/increment")
async def increment_streak(current_user: dict = Depends(get_current_user)):
    try:
        # Get current user data
        users = db_client.execute_query(
            "SELECT * FROM users WHERE id = %s",
            (current_user["id"],)
        )
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = users[0]
        new_streak = user["streak_count"] + 1
        best_streak = max(user["best_streak"], new_streak)
        
        # Update user
        db_client.execute_update(
            "UPDATE users SET streak_count = %s, best_streak = %s WHERE id = %s",
            (new_streak, best_streak, current_user["id"])
        )
        
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
    try:
        # Get logs from last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        logs = db_client.execute_query(
            "SELECT * FROM junk_food_logs WHERE user_id = %s AND created_at >= %s",
            (current_user["id"], week_ago)
        )
        
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
            if hasattr(log["created_at"], "isoformat"):
                date = log["created_at"].isoformat()[:10]
            else:
                date = str(log["created_at"])[0:10]
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
async def get_community_posts(limit: int = 20, offset: int = 0, current_user: dict = Depends(get_current_user)):
    try:
        posts = db_client.execute_query(
            "SELECT * FROM community_posts_with_reply_count WHERE is_anonymous = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (True, limit, offset)
        )
        result = []
        for post in posts:
            liked = db_client.execute_query(
                "SELECT 1 FROM community_post_likes WHERE user_id = %s AND post_id = %s",
                (current_user["id"], post["id"])
            )
            result.append({
                "id": post["id"],
                "content": post["content"],
                "photo_url": post.get("photo_url"),
                "likes_count": post.get("likes_count", 0),
                "created_at": post["created_at"],
                "liked_by_user": bool(liked),
                "replies_count": post.get("replies_count", 0)
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/community/posts")
async def create_community_post(
    post_data: CommunityPostCreate,
    current_user: dict = Depends(get_current_user)
):
    # Input validation
    if not post_data.content or len(post_data.content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    if len(post_data.content) > 500:
        raise HTTPException(status_code=400, detail="Content too long (max 500 chars).")
    if is_profane(post_data.content):
        raise HTTPException(status_code=400, detail="Inappropriate language detected.")
    # Rate limit
    if not check_rate_limit(current_user["id"], 'post'):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    try:
        post = db_client.execute_insert(
            """
            INSERT INTO community_posts (user_id, content, photo_url, is_anonymous, likes_count, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (current_user["id"], post_data.content, post_data.photo_url, post_data.is_anonymous, 0, datetime.utcnow())
        )
        
        if not post:
            raise HTTPException(status_code=500, detail="Failed to create post")
        
        return {
            "id": post["id"],
            "content": post["content"],
            "photo_url": post.get("photo_url"),
            "likes_count": post["likes_count"],
            "created_at": post["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/community/posts/{post_id}/like")
async def like_community_post(post_id: int, current_user: dict = Depends(get_current_user)):
    if not check_rate_limit(current_user["id"], 'like'):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    try:
        # Check if post exists
        posts = db_client.execute_query(
            "SELECT * FROM community_posts WHERE id = %s",
            (post_id,)
        )
        if not posts:
            raise HTTPException(status_code=404, detail="Post not found")

        # Check if user already liked
        existing_like = db_client.execute_query(
            "SELECT * FROM community_post_likes WHERE user_id = %s AND post_id = %s",
            (current_user["id"], post_id)
        )
        if existing_like:
            # If already liked, do nothing and return current count
            updated_post = db_client.execute_query(
                "SELECT likes_count FROM community_posts WHERE id = %s",
                (post_id,)
            )
            likes_count = updated_post[0]["likes_count"] if updated_post else None
            return {"success": True, "likes_count": likes_count}

        # Insert like
        db_client.execute_insert(
            """
            INSERT INTO community_post_likes (user_id, post_id)
            VALUES (%s, %s)
            """,
            (current_user["id"], post_id)
        )

        # Increment likes_count
        db_client.execute_update(
            "UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = %s",
            (post_id,)
        )

        # Get updated count
        updated_post = db_client.execute_query(
            "SELECT likes_count FROM community_posts WHERE id = %s",
            (post_id,)
        )
        likes_count = updated_post[0]["likes_count"] if updated_post else None
        return {"success": True, "likes_count": likes_count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/community/posts/{post_id}/like")
async def unlike_community_post(post_id: int, current_user: dict = Depends(get_current_user)):
    if not check_rate_limit(current_user["id"], 'like'):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    try:
        # Check if post exists
        posts = db_client.execute_query(
            "SELECT * FROM community_posts WHERE id = %s",
            (post_id,)
        )
        if not posts:
            raise HTTPException(status_code=404, detail="Post not found")

        # Check if user has liked
        existing_like = db_client.execute_query(
            "SELECT * FROM community_post_likes WHERE user_id = %s AND post_id = %s",
            (current_user["id"], post_id)
        )
        if existing_like:
            # Delete like
            db_client.execute_update(
                "DELETE FROM community_post_likes WHERE user_id = %s AND post_id = %s",
                (current_user["id"], post_id)
            )
            # Decrement likes_count, but not below zero
            db_client.execute_update(
                "UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = %s",
                (post_id,)
            )

        # Get updated count
        updated_post = db_client.execute_query(
            "SELECT likes_count FROM community_posts WHERE id = %s",
            (post_id,)
        )
        likes_count = updated_post[0]["likes_count"] if updated_post else None
        return {"success": True, "likes_count": likes_count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/community/posts/{post_id}/replies")
async def create_reply(post_id: int, content: str = Body(...), is_anonymous: bool = Body(True), current_user: dict = Depends(get_current_user)):
    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Reply cannot be empty.")
    if len(content) > 500:
        raise HTTPException(status_code=400, detail="Reply too long (max 500 chars).")
    if is_profane(content):
        raise HTTPException(status_code=400, detail="Inappropriate language detected.")
    if not check_rate_limit(current_user["id"], 'reply'):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    try:
        # Check if post exists
        posts = db_client.execute_query(
            "SELECT * FROM community_posts WHERE id = %s",
            (post_id,)
        )
        if not posts:
            raise HTTPException(status_code=404, detail="Post not found")
        reply = db_client.execute_insert(
            """
            INSERT INTO community_post_replies (post_id, user_id, content, is_anonymous)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (post_id, current_user["id"], content, is_anonymous)
        )
        if not reply:
            raise HTTPException(status_code=500, detail="Failed to create reply")
        return {
            "id": reply["id"],
            "post_id": reply["post_id"],
            "user_id": reply["user_id"],
            "content": reply["content"],
            "is_anonymous": reply["is_anonymous"],
            "created_at": reply["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/community/posts/{post_id}/replies")
async def get_replies(post_id: int, current_user: dict = Depends(get_current_user)):
    try:
        replies = db_client.execute_query(
            "SELECT * FROM community_post_replies WHERE post_id = %s ORDER BY created_at ASC",
            (post_id,)
        )
        return [
            {
                "id": reply["id"],
                "post_id": reply["post_id"],
                "user_id": reply["user_id"],
                "content": reply["content"],
                "is_anonymous": reply["is_anonymous"],
                "created_at": reply["created_at"]
            }
            for reply in replies
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UserProfileUpdate(BaseModel):
    username: str
    email: str = None

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

@app.put("/api/user/profile")
async def update_user_profile(update: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    if not update.username or len(update.username.strip()) == 0:
        raise HTTPException(status_code=400, detail="Username cannot be empty.")
    if len(update.username) > 32:
        raise HTTPException(status_code=400, detail="Username too long (max 32 chars).")
    if update.email and len(update.email) > 100:
        raise HTTPException(status_code=400, detail="Email too long (max 100 chars).")
    try:
        # Only allow updating username and (optionally) email
        db_client.execute_update(
            "UPDATE users SET username = %s{} WHERE id = %s".format(
                ", email = %s" if update.email else ""
            ),
            (update.username, update.email, current_user["id"]) if update.email else (update.username, current_user["id"])
        )
        # Return updated profile
        user = db_client.execute_query(
            "SELECT * FROM users WHERE id = %s",
            (current_user["id"],)
        )[0]
        return {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "streak_count": user["streak_count"],
            "best_streak": user["best_streak"],
            "created_at": user["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/change-password")
async def change_password(req: PasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Get current user
        user = db_client.execute_query(
            "SELECT * FROM users WHERE id = %s",
            (current_user["id"],)
        )[0]
        # Check old password
        if not bcrypt.verify(req.old_password, user["password_hash"]):
            raise HTTPException(status_code=400, detail="Old password is incorrect")
        # Update password
        new_hash = bcrypt.hash(req.new_password)
        db_client.execute_update(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (new_hash, current_user["id"])
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/community/posts/{post_id}")
async def delete_community_post(post_id: int, current_user: dict = Depends(get_current_user)):
    post = db_client.execute_query(
        "SELECT * FROM community_posts WHERE id = %s",
        (post_id,)
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post[0]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post.")
    db_client.execute_update(
        "DELETE FROM community_posts WHERE id = %s",
        (post_id,)
    )
    return {"success": True}

@app.delete("/api/community/replies/{reply_id}")
async def delete_reply(reply_id: int, current_user: dict = Depends(get_current_user)):
    reply = db_client.execute_query(
        "SELECT * FROM community_post_replies WHERE id = %s",
        (reply_id,)
    )
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    if reply[0]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply.")
    db_client.execute_update(
        "DELETE FROM community_post_replies WHERE id = %s",
        (reply_id,)
    )
    return {"success": True}

@app.get("/api/user/posts")
async def get_user_posts(current_user: dict = Depends(get_current_user)):
    posts = db_client.execute_query(
        "SELECT * FROM community_posts WHERE user_id = %s ORDER BY created_at DESC",
        (current_user["id"],)
    )
    return posts

@app.get("/api/user/replies")
async def get_user_replies(current_user: dict = Depends(get_current_user)):
    replies = db_client.execute_query(
        "SELECT * FROM community_post_replies WHERE user_id = %s ORDER BY created_at DESC",
        (current_user["id"],)
    )
    return replies

if __name__ == "__main__":
    print("Starting JunkStop FastAPI backend server...")
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)