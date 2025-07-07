from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from datetime import datetime, timedelta
from typing import List, Optional, Any
import base64
from PIL import Image
import io
from dotenv import load_dotenv
from pydantic import BaseModel
from passlib.hash import bcrypt
import time
import json
from fastapi import BackgroundTasks
import subprocess
import traceback

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

def compose_video_from_images(image_paths, output_path, duration=5):
    """
    Compose a video from a list of image file paths using ffmpeg.
    Each image is shown for 'duration' seconds.
    """
    list_file = 'input_images.txt'
    with open(list_file, 'w') as f:
        for img in image_paths:
            f.write(f"file '{img}'\n")
            f.write(f"duration {duration}\n")
        f.write(f"file '{image_paths[-1]}'\n")
    cmd = [
        'ffmpeg',
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', list_file,
        '-vf', 'format=yuv420p',
        '-movflags', '+faststart',
        output_path
    ]
    subprocess.run(cmd, check=True)
    os.remove(list_file)

def compose_viral_video_with_overlays(base_video_path, overlays, output_path):
    """
    Compose a viral video by overlaying animated GIFs, labels, and sound effects on top of a base video.
    overlays: list of dicts with keys: gif_path, label, x, y, start, end, sound_path
    """
    import shlex
    import subprocess
    filter_complex = []
    input_args = ['-i', base_video_path]
    gif_input_indices = []
    audio_input_indices = []
    input_idx = 1  # 0 is base video

    # Build input_args and track indices
    for overlay in overlays:
        # Add GIF
        input_args += ['-ignore_loop', '0', '-i', overlay['gif_path']]
        gif_input_indices.append(input_idx)
        input_idx += 1
        # Add sound if present
        if overlay.get('sound_path'):
            input_args += ['-ss', str(overlay['start']), '-t', str(overlay['end'] - overlay['start']), '-i', overlay['sound_path']]
            audio_input_indices.append(input_idx)
            input_idx += 1

    # Build overlay filters
    last_stream = '[0:v]'
    audio_streams = []
    gif_idx = 0
    audio_idx = 0
    for idx, overlay in enumerate(overlays):
        gif_stream = f'[{gif_input_indices[gif_idx]}:v]'
        out_stream = f'[v{idx+1}]'
        overlay_filter = (
            f"{last_stream}{gif_stream} overlay=x={overlay['x']}:y={overlay['y']}:shortest=1:enable='between(t,{overlay['start']},{overlay['end']})'{out_stream}"
        )
        filter_complex.append(overlay_filter)
        label_filter = (
            f"{out_stream} drawtext=text='{overlay['label']}':fontcolor=white:fontsize=32:x={overlay['x']}:y={overlay['y']}+100:enable='between(t,{overlay['start']},{overlay['end']})'[v{idx+1}l]"
        )
        filter_complex.append(label_filter)
        last_stream = f'[v{idx+1}l]'
        gif_idx += 1
        # Audio stream for this overlay
        if overlay.get('sound_path'):
            audio_streams.append(f'[{audio_input_indices[audio_idx]}:a]')
            audio_idx += 1

    # Mix only overlay audio streams (mute base video audio)
    if audio_streams:
        amix_filter = f'{"".join(audio_streams)}amix=inputs={len(audio_streams)}:duration=longest[aout]'
        filter_complex.append(amix_filter)
        map_audio = ['-map', '[aout]']
    else:
        # No overlay audio, use anullsrc (silence)
        filter_complex.append('anullsrc=r=44100:cl=stereo[aout]')
        map_audio = ['-map', '[aout]']

    filter_complex_str = '; '.join(filter_complex)
    cmd = [
        'ffmpeg',
        '-y',
        '-loglevel', 'error',  # Only show errors
        *input_args,
        '-filter_complex', filter_complex_str,
        '-map', last_stream,
        *map_audio,
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        output_path
    ]
    print('Running ffmpeg command:', ' '.join(cmd))
    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        print("ffmpeg error output:\n", result.stderr)
        result.check_returncode()

def boomerang_video(input_path, output_path):
    """
    Create a boomerang (forward + reverse) loop from input_path and save to output_path.
    """
    import tempfile
    import shutil
    # 1. Reverse the video (excluding last frame to avoid stutter)
    reversed_path = tempfile.mktemp(suffix='.mp4')
    # Reverse video
    reverse_cmd = [
        'ffmpeg', '-y', '-i', input_path,
        '-vf', 'reverse',
        '-af', 'areverse',
        reversed_path
    ]
    subprocess.run(reverse_cmd, check=True)
    # 2. Concatenate forward and reversed videos
    concat_list = tempfile.mktemp(suffix='.txt')
    with open(concat_list, 'w') as f:
        f.write(f"file '{os.path.abspath(input_path)}'\n")
        f.write(f"file '{os.path.abspath(reversed_path)}'\n")
    concat_cmd = [
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', concat_list,
        '-c', 'copy', output_path
    ]
    subprocess.run(concat_cmd, check=True)
    # Cleanup
    os.remove(reversed_path)
    os.remove(concat_list)

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
        post = posts[0]
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

        # Notification: only if liker is not the post owner
        if post["user_id"] != current_user["id"]:
            db_client.execute_insert(
                """
                INSERT INTO notifications (user_id, type, post_id, message, created_at)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    post["user_id"],
                    'like',
                    post_id,
                    f"Your post received a like!",
                    datetime.utcnow()
                )
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
        post = posts[0]
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
        # Notification: only if replier is not the post owner
        if post["user_id"] != current_user["id"]:
            db_client.execute_insert(
                """
                INSERT INTO notifications (user_id, type, post_id, reply_id, message, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    post["user_id"],
                    'reply',
                    post_id,
                    reply["id"],
                    f"Your post received a reply!",
                    datetime.utcnow()
                )
            )
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

@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    try:
        notifications = db_client.execute_query(
            """
            SELECT id, post_id, reply_id, message, type, read, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 50
            """,
            (current_user["id"],)
        )
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, current_user: dict = Depends(get_current_user)):
    try:
        db_client.execute_update(
            "UPDATE notifications SET read = TRUE WHERE id = %s AND user_id = %s",
            (notification_id, current_user["id"])
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3D Scene Export Job System ---
# (Simple version: accepts a base64 image, saves it, and tracks job status)

# You should create a new table in your DB for scene_exports:
# CREATE TABLE scene_exports (
#   id SERIAL PRIMARY KEY,
#   user_id INTEGER NOT NULL,
#   status VARCHAR(20) NOT NULL,
#   file_url TEXT,
#   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
#   updated_at TIMESTAMP NOT NULL DEFAULT NOW()
# );

@app.post("/api/export-scene")
async def export_scene(
    image_base64: str = Body(...),
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    # Insert job into DB
    job = db_client.execute_insert(
        """
        INSERT INTO scene_exports (user_id, status, created_at, updated_at)
        VALUES (%s, %s, NOW(), NOW()) RETURNING *
        """,
        (current_user["id"], "pending")
    )
    if not job:
        raise HTTPException(status_code=500, detail="Failed to create export job")
    background_tasks.add_task(process_scene_export_job, job["id"], image_base64)
    return {
        "id": job["id"],
        "status": "pending",
        "created_at": job["created_at"],
        "updated_at": job["updated_at"]
    }

@app.get("/api/export-scene/{job_id}/status")
async def get_export_scene_status(job_id: int, current_user: dict = Depends(get_current_user), request: Request = None):
    jobs = db_client.execute_query(
        "SELECT * FROM scene_exports WHERE id = %s AND user_id = %s",
        (job_id, current_user["id"])
    )
    if not jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs[0]
    # If file_url is present and relative, make it absolute
    file_url = job.get("file_url")
    if file_url and not file_url.startswith("http"):
        base_url = str(request.base_url).rstrip("/")
        job["file_url"] = base_url + file_url
    return job

def process_scene_export_job(job_id: int, image_base64: str):
    import os
    from datetime import datetime
    try:
        uploads_dir = "/tmp/uploads"
        os.makedirs(uploads_dir, exist_ok=True)
        output_filename = f"scene_export_{job_id}.png"
        output_path = os.path.join(uploads_dir, output_filename)
        # Save the base64 image to file
        with open(output_path, "wb") as f:
            f.write(base64.b64decode(image_base64))
        # Update job status and file_url
        db_client.execute_update(
            "UPDATE scene_exports SET status = %s, file_url = %s, updated_at = %s WHERE id = %s",
            ("complete", f"/uploads/{output_filename}", datetime.utcnow(), job_id)
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        db_client.execute_update(
            "UPDATE scene_exports SET status = %s, file_url = %s, updated_at = %s WHERE id = %s",
            ("failed", None, datetime.utcnow(), job_id)
        )

if __name__ == "__main__":
    print("Starting JunkStop FastAPI backend server...")
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)