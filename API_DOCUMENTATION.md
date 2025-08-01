# JunkStop API Documentation

Base URL: `http://localhost:5000`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Demo Account
- Email: `demo@junkstop.com`
- Password: `password`

## API Endpoints

### 1. Root & Health

#### GET `/`
Returns API information and available endpoints.

**Response:**
```json
{
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
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-22T12:00:00.000000"
}
```

### 2. Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "streak_count": 0,
  "best_streak": 0,
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "streak_count": 5,
  "best_streak": 15,
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### 3. User Management

#### GET `/api/user/profile`
Get user profile and statistics. **Requires authentication.**

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "streak_count": 5,
  "best_streak": 15,
  "total_saved": 45.50,
  "avg_guilt_score": 6.2,
  "total_logs": 23,
  "created_at": "2025-01-15T10:30:00"
}
```

#### POST `/api/streak/increment`
Increment user's clean eating streak. **Requires authentication.**

**Response:**
```json
{
  "streak_count": 6,
  "best_streak": 15,
  "is_new_record": false
}
```

### 4. Junk Food Logging

#### POST `/api/logs`
Create a new junk food log entry with photo. **Requires authentication.**

**Request:** Multipart form data
- `photo`: Image file (required)
- `food_type`: String (required)
- `guilt_rating`: Integer 1-10 (required)
- `regret_rating`: Integer 1-10 (required)
- `estimated_cost`: Float (optional)
- `location`: String (optional)

**Response:**
```json
{
  "id": 1,
  "photo_url": "/uploads/user_1_timestamp.jpg",
  "food_type": "Pizza slice",
  "guilt_rating": 7,
  "regret_rating": 8,
  "estimated_cost": 5.99,
  "estimated_calories": 300,
  "location": "Downtown restaurant",
  "created_at": "2025-06-22T12:00:00",
  "ai_motivation": "Every setback is a setup for a comeback..."
}
```

#### GET `/api/logs`
Get user's junk food logs with pagination. **Requires authentication.**

**Query Parameters:**
- `limit`: Integer (default: 20)
- `offset`: Integer (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "photo_url": "/uploads/user_1_timestamp.jpg",
    "food_type": "Pizza slice",
    "guilt_rating": 7,
    "regret_rating": 8,
    "estimated_cost": 5.99,
    "estimated_calories": 300,
    "location": "Downtown restaurant",
    "created_at": "2025-06-22T12:00:00"
  }
]
```

### 5. Analytics & Progress

#### GET `/api/analytics/weekly`
Get weekly consumption analytics. **Requires authentication.**

**Response:**
```json
{
  "total_logs": 5,
  "avg_guilt_score": 6.8,
  "avg_regret_score": 7.2,
  "total_cost": 29.95,
  "total_calories": 1450,
  "daily_breakdown": [
    {
      "date": "2025-06-20",
      "count": 2,
      "avg_guilt": 7.0,
      "avg_regret": 7.5,
      "total_cost": 11.98,
      "total_calories": 600
    }
  ]
}
```

### 6. AI Coach

#### GET `/api/ai/daily-insight`
Get AI-generated daily insight. **Requires authentication.**

**Response:**
```json
{
  "insight": "You've been making great progress this week...",
  "generated_at": "2025-06-22T12:00:00.000000"
}
```

#### POST `/api/ai/chat`
Chat with AI coach. **Requires authentication.**

**Request Body:**
```json
{
  "message": "I'm feeling tempted to eat junk food",
  "guilt_level": 6,
  "regret_level": 7
}
```

**Response:**
```json
{
  "response": "I understand that temptation can be strong...",
  "timestamp": "2025-06-22T12:00:00.000000"
}
```

### 7. Community

#### GET `/api/community/posts`
Get community posts.

**Query Parameters:**
- `limit`: Integer (default: 20)
- `offset`: Integer (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "content": "Day 5 of no junk food! Feeling great!",
    "photo_url": null,
    "likes_count": 12,
    "created_at": "2025-06-22T10:30:00"
  }
]
```

#### POST `/api/community/posts`
Create a new community post. **Requires authentication.**

**Request Body:**
```json
{
  "content": "Just completed my first week without junk food!",
  "photo_url": null,
  "is_anonymous": true
}
```

**Response:**
```json
{
  "id": 1,
  "content": "Just completed my first week without junk food!",
  "photo_url": null,
  "likes_count": 0,
  "created_at": "2025-06-22T12:00:00"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production deployment.

## File Uploads

- **Supported formats**: JPG, JPEG, PNG
- **Max file size**: 10MB
- **Storage**: Local filesystem under `/tmp/uploads`
- **URL format**: `/uploads/filename`

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- CORS is enabled for all origins (configure for production)
- File uploads are validated for type and size
- SQL queries use parameterized statements to prevent injection

---

## AI Voice Chat Endpoint (LiveKit Agent Integration)

### POST `/api/ai/voice-chat`

**Description:**
Accepts a base64-encoded audio input, uses LiveKit Agent (>=1.0) for speech-to-text (STT) and text-to-speech (TTS), and returns the AI response as both text and synthesized audio.

**Request Body:** (`AudioChatRequest`)
```json
{
  "audio_base64": "<base64-encoded audio>",
  "guilt_level": 5,           // optional, integer 0-10
  "regret_level": 5,          // optional, integer 0-10
  "message": "optional text"  // optional, additional user message
}
```

**Response:** (`AudioChatResponse`)
```json
{
  "response_text": "AI-generated motivational message",
  "audio_base64": "<base64-encoded synthesized audio>",
  "timestamp": "2024-07-01T12:34:56.789Z"
}
```

**How it works:**
1. The endpoint receives a base64-encoded audio file (e.g., WAV/OGG/MP3).
2. It sends the audio to the LiveKit Agent `/stt` endpoint for speech-to-text.
3. The recognized text (optionally combined with a user message) is sent to the AI coach for a motivational response.
4. The AI response text is sent to the LiveKit Agent `/tts` endpoint for speech synthesis.
5. The endpoint returns both the AI response text and the synthesized audio (base64-encoded).

**Environment Variable:**
- `LIVEKIT_AGENT_URL` (default: `http://localhost:8080`)

**Example cURL:**
```bash
curl -X POST https://your-backend.com/api/ai/voice-chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_base64": "...",
    "guilt_level": 7,
    "regret_level": 8
  }'
```

---

## LiveKit Token Generation Endpoint

### POST `/api/livekit/token`

**Description:**
Generates a LiveKit access token for a user or AI agent to join a LiveKit room. Every participant (human or agent) must use a unique token to join a room.

**Request Body:**
```json
{
  "user_id": "string",      // required, unique user or agent identifier
  "room_name": "string",    // required, LiveKit room name
  "is_agent": false          // optional, set true for AI agent
}
```

**Response:**
```json
{
  "token": "<jwt-token>"
}
```

**How to Use:**
- **Human user:**
  - Set `is_agent` to `false` (or omit).
  - Use the returned token to join the room from the frontend/mobile app.
- **AI agent:**
  - Set `is_agent` to `true`.
  - Use the returned token for the agent process to join the room as the AI assistant.

**Example cURL:**
```bash
curl -X POST https://your-backend.com/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "room_name": "junkstop-room-1"
  }'

curl -X POST https://your-backend.com/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "room_name": "junkstop-room-1",
    "is_agent": true
  }'
```

**Environment Variables:**
- `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` must be set in your backend environment.

---