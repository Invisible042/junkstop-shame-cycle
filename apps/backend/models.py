from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    streak_count: int
    best_streak: int
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    id: int
    email: str
    username: str
    streak_count: int
    best_streak: int
    total_saved: float
    avg_guilt_score: float
    total_logs: int
    created_at: str

# Junk food log models
class JunkFoodLogCreate(BaseModel):
    food_type: str
    guilt_rating: int
    regret_rating: int
    estimated_cost: Optional[float] = None
    location: Optional[str] = None

class JunkFoodLogResponse(BaseModel):
    id: int
    photo_url: str
    food_type: str
    guilt_rating: int
    regret_rating: int
    estimated_cost: float
    estimated_calories: int
    location: Optional[str]
    created_at: str
    ai_motivation: Optional[str] = None

# AI Chat models
class ChatMessage(BaseModel):
    message: str
    guilt_level: Optional[int] = None
    regret_level: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str

# Community models
class CommunityPostCreate(BaseModel):
    content: str
    photo_url: Optional[str] = None
    is_anonymous: bool = True

class CommunityPostResponse(BaseModel):
    id: int
    content: str
    photo_url: Optional[str]
    likes_count: int
    created_at: str

# Analytics models
class WeeklyAnalytics(BaseModel):
    total_logs: int
    avg_guilt_score: float
    avg_regret_score: float
    total_cost: float
    total_calories: int
    daily_breakdown: List[dict]

# Achievement models
class Achievement(BaseModel):
    id: int
    user_id: int
    badge_type: str
    badge_name: str
    description: str
    earned_date: str

class VideoShareCreate(BaseModel):
    input_data: dict  # e.g., log IDs, overlays, etc.

class VideoShareResponse(BaseModel):
    id: int
    user_id: int
    input_data: dict
    status: str
    video_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: str
    updated_at: str