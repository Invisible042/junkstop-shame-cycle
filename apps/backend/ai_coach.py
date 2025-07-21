import os
from dotenv import load_dotenv
load_dotenv()
import httpx
from typing import Optional
from postgres_client import db_client
from datetime import datetime

# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

async def generate_motivation(user_id: int, guilt_rating: int, regret_rating: int, custom_message: Optional[str] = None) -> str:
    """Generate AI-powered motivation message based on user's guilt and regret ratings"""
    print("we are in generate_motivation func in ai coach.py")
    # Get user's recent patterns
    recent_logs = db_client.execute_query(
        "SELECT * FROM junk_food_logs WHERE user_id = %s ORDER BY created_at DESC LIMIT 10",
        (user_id,)
    )
    
    # Calculate pattern data
    avg_guilt = sum([log.get("guilt_rating", 0) for log in recent_logs]) / len(recent_logs) if recent_logs else 0
    try:
        week_start = datetime(2024, 1, 1)
        total_logs_week = len([
            log for log in recent_logs
            if isinstance(log.get("created_at"), datetime) and log.get("created_at") >= week_start
        ])
    except Exception as e:
        print(f"Error, failed to get total logs week: {e}")
        total_logs_week = 0
          # Simplified date check
    # Create context for AI
    context = f"""
    User just logged junk food with:
    - Guilt rating: {guilt_rating}/10
    - Regret rating: {regret_rating}/10
    - Recent average guilt: {avg_guilt:.1f}/10
    - Junk food incidents this week: {total_logs_week}
    """
    
    if custom_message:
        context += f"\n- User message: {custom_message}"
    
    # If no API key, return fallback motivational message
    if not OPENROUTER_API_KEY:
        return get_fallback_motivation(guilt_rating, regret_rating, total_logs_week)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a tough-love junk food addiction coach. Be direct, supportive, and motivating. Keep responses under 100 words. Focus on getting back on track, not dwelling on the mistake."
                        },
                        {
                            "role": "user",
                            "content": context
                        }
                    ],
                    "max_tokens": 150
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
            else:
                return get_fallback_motivation(guilt_rating, regret_rating, total_logs_week)
                
    except Exception:
        return get_fallback_motivation(guilt_rating, regret_rating, total_logs_week)

async def voice_chat_with_livekit_agent(
    audio_base64: str,
    user_id: int,
    guilt_level: Optional[int] = None,
    regret_level: Optional[int] = None,
    message: Optional[str] = None
) -> dict:
    """
    Handles AI voice chat using LiveKit Agent for STT and TTS.
    Returns a dict with 'response_text' and 'audio_base64'.
    """
    LIVEKIT_AGENT_URL = os.getenv("LIVEKIT_AGENT_URL", "http://localhost:8080")
    try:
        # 1. Speech-to-Text (STT)
        async with httpx.AsyncClient() as client:
            stt_response = await client.post(
                f"{LIVEKIT_AGENT_URL}/stt",
                json={"audio_base64": audio_base64}
            )
            stt_response.raise_for_status()
            stt_data = stt_response.json()
            user_text = stt_data.get("text", "")
        # Combine with optional message
        if message:
            user_text = f"{user_text}\n{message}" if user_text else message
        # 2. Generate AI response
        guilt = guilt_level if guilt_level is not None else 5
        regret = regret_level if regret_level is not None else 5
        ai_response_text = await generate_motivation(user_id, guilt, regret, user_text)
        # 3. Text-to-Speech (TTS)
        async with httpx.AsyncClient() as client:
            tts_response = await client.post(
                f"{LIVEKIT_AGENT_URL}/tts",
                json={"text": ai_response_text}
            )
            tts_response.raise_for_status()
            tts_data = tts_response.json()
            ai_audio_base64 = tts_data.get("audio_base64")
        return {
            "response_text": ai_response_text,
            "audio_base64": ai_audio_base64
        }
    except Exception as e:
        raise RuntimeError(f"Voice chat with LiveKit Agent failed: {str(e)}")

async def start_livekit_agent_session(user_id: str, room_name: str):
    """
    Starts a LiveKit Agent session for the given user and room using the livekit-agent SDK.
    This should be called when a user joins a room to ensure the AI assistant joins as well.
    """
    try:
        from livekit_agent import AgentSession, AgentConfig
        import os
        LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
        LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
        ws_url = os.getenv("LIVEKIT_WS_URL", "wss://your-livekit-server.com")
        agent_identity = f"agent_{user_id}"
        agent_config = AgentConfig(
            ws_url=ws_url,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
            identity=agent_identity,
            name="AI Assistant",
            room_name=room_name,
            # Add any additional config needed for your agent (e.g., STT/TTS/AI endpoints)
        )
        AgentSession.start(agent_config)
        print(f"Started LiveKit Agent session for room {room_name} (user {user_id})")
    except ImportError:
        print("livekit-agent SDK not installed; skipping agent auto-start.")
    except Exception as agent_exc:
        print(f"Failed to start LiveKit Agent session: {agent_exc}")

def get_fallback_motivation(guilt_rating: int, regret_rating: int, total_logs_week: int) -> str:
    """Fallback motivation messages when AI is not available"""
    
    if guilt_rating >= 8 and regret_rating >= 8:
        return "That guilt shows you care about your health. Use this feeling as fuel - you're stronger than this craving. Start fresh right now."
    elif guilt_rating >= 6:
        return f"You've logged {total_logs_week} times this week. Each slip is data, not failure. What will you do differently in the next hour?"
    elif guilt_rating <= 3:
        return "Low guilt might mean you're getting comfortable with junk food again. Remember why you started this journey. Your future self is counting on you."
    else:
        return "Every champion has setbacks. What matters is how quickly you bounce back. Your streak starts now - make the next choice count."

async def estimate_calories(food_description: str) -> int:
    """Estimate calories from food description using AI or fallback"""
    
    if not OPENROUTER_API_KEY:
        return get_fallback_calories(food_description)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a nutrition expert. Estimate calories for junk food items. Respond with only a number (no text)."
                        },
                        {
                            "role": "user",
                            "content": f"Estimate calories for: {food_description}"
                        }
                    ],
                    "max_tokens": 50
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                calories_text = result["choices"][0]["message"]["content"].strip()
                # Extract number from response
                calories = int(''.join(filter(str.isdigit, calories_text)))
                return min(max(calories, 50), 2000)  # Reasonable bounds
            else:
                return get_fallback_calories(food_description)
                
    except Exception:
        return get_fallback_calories(food_description)

def get_fallback_calories(food_description: str) -> int:
    """Fallback calorie estimation based on common junk foods"""
    
    description_lower = food_description.lower()
    
    # Simple keyword-based estimation
    if any(word in description_lower for word in ["burger", "big mac", "whopper"]):
        return 550
    elif any(word in description_lower for word in ["pizza", "slice"]):
        return 300
    elif any(word in description_lower for word in ["fries", "chips"]):
        return 400
    elif any(word in description_lower for word in ["soda", "coke", "pepsi"]):
        return 150
    elif any(word in description_lower for word in ["candy", "chocolate", "bar"]):
        return 250
    elif any(word in description_lower for word in ["ice cream", "sundae"]):
        return 350
    elif any(word in description_lower for word in ["donut", "doughnut"]):
        return 300
    elif any(word in description_lower for word in ["cookie", "cookies"]):
        return 200
    else:
        return 400  # Default estimate

async def analyze_patterns(user_id: int) -> str:
    """Analyze user patterns and provide insights"""
    
    # Get recent logs
    logs = db_client.execute_query(
        "SELECT * FROM junk_food_logs WHERE user_id = %s ORDER BY created_at DESC LIMIT 20",
        (user_id,)
    )
    
    if not logs:
        return "Start logging your junk food to get personalized insights about your eating patterns."
    
    # Analyze patterns
    total_logs = len(logs)
    avg_guilt = sum([log.get("guilt_rating", 0) for log in logs]) / total_logs
    avg_regret = sum([log.get("regret_rating", 0) for log in logs]) / total_logs
    
    # Time patterns (simplified)
    try:
        morning_logs = len([
            log for log in logs
            if isinstance(log.get("created_at"), datetime) and 5 <= log["created_at"].hour < 12
        ])
        evening_logs = len([
            log for log in logs
            if isinstance(log.get("created_at"), datetime) and 17 <= log["created_at"].hour < 22
        ])
    except Exception as e:
        print(f"Error analyzing morning/evening logs: {e}")
        morning_logs = 0
        evening_logs = 0
    
    if not OPENROUTER_API_KEY:
        return get_fallback_insight(total_logs, avg_guilt, avg_regret)
    
    try:
        pattern_data = f"""
        User has logged {total_logs} junk food incidents recently.
        Average guilt: {avg_guilt:.1f}/10
        Average regret: {avg_regret:.1f}/10
        Patterns: {morning_logs} morning incidents, {evening_logs} evening incidents
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a behavioral analyst. Provide a brief, actionable insight about junk food patterns. Keep it under 80 words and focus on actionable advice."
                        },
                        {
                            "role": "user",
                            "content": pattern_data
                        }
                    ],
                    "max_tokens": 120
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
            else:
                return get_fallback_insight(total_logs, avg_guilt, avg_regret)
                
    except Exception:
        return get_fallback_insight(total_logs, avg_guilt, avg_regret)

def get_fallback_insight(total_logs: int, avg_guilt: float, avg_regret: float) -> str:
    """Fallback insights when AI is not available"""
    
    if avg_guilt >= 7:
        return f"High guilt levels ({avg_guilt:.1f}/10) show you're aware this isn't serving you. Channel that awareness into planning alternatives for your next craving."
    elif avg_guilt <= 3:
        return f"Low guilt levels ({avg_guilt:.1f}/10) might indicate you're becoming too comfortable with junk food. Remember your health goals and why you started tracking."
    elif total_logs >= 10:
        return f"You've logged {total_logs} incidents recently. Consider identifying your triggers - time, place, or emotions that lead to junk food choices."
    else:
        return "Track more consistently to identify patterns. The more data you log, the better insights you'll get about your eating triggers."