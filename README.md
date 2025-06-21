# JunkStop - Junk Food Accountability Mobile App

A React Native mobile app with FastAPI backend that helps users break their junk food addiction through shame-based accountability, streak tracking, and AI coaching.

## Project Structure

```
├── mobile/                 # React Native Expo mobile app
├── apps/
│   └── backend/           # FastAPI Python backend
├── shared/                # Shared types and schemas
└── dev.py                # Unified development script
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Expo CLI
- Mobile device or emulator

### Development

1. **Install dependencies:**
   ```bash
   python dev.py install
   ```

2. **Start full development environment:**
   ```bash
   python dev.py
   ```
   This starts both the FastAPI backend (port 8000) and React Native mobile app.

3. **Start individual services:**
   ```bash
   python dev.py backend    # Backend only
   python dev.py mobile     # Mobile only
   ```

### Mobile App Setup

1. Install Expo Go app on your mobile device
2. Run `python dev.py mobile` 
3. Scan the QR code with Expo Go to test on your device

## Features

### Core Functionality
- **Photo Logging**: Take photos of junk food with guilt/regret ratings
- **Streak Tracking**: Monitor days without junk food consumption
- **AI Coaching**: Get personalized motivation and pattern analysis
- **Community**: Anonymous confession sharing
- **Analytics**: Weekly progress and money saved tracking

### Technical Features
- **Authentication**: JWT-based secure login/registration
- **Real-time Data**: React Query for seamless data synchronization
- **File Upload**: Image compression and secure storage
- **Offline Support**: Secure local storage for authentication
- **Dark Theme**: Mobile-optimized UI with glassmorphism effects

## Backend API

The FastAPI backend provides:
- `/api/auth/*` - Authentication endpoints
- `/api/logs/*` - Junk food logging
- `/api/analytics/*` - Progress tracking
- `/api/ai/*` - AI coaching features
- `/api/community/*` - Community features

## Environment Variables

For production, configure:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENROUTER_API_KEY` - OpenRouter API key for AI features
- `JWT_SECRET_KEY` - JWT signing secret

## Architecture

- **Frontend**: React Native with Expo, TypeScript, React Query
- **Backend**: FastAPI with Python, async/await
- **Database**: Supabase PostgreSQL with local fallback
- **Authentication**: JWT tokens with secure storage
- **AI Integration**: OpenRouter API with fallback responses
- **Mobile**: Cross-platform iOS/Android support

## Development Workflow

The monorepo is designed for unified development:
- Single command starts both services
- Shared types between frontend/backend
- Hot reload for both mobile and backend
- Integrated error handling and logging