# JunkStop Mobile - React Native App

A React Native (Expo) mobile application that helps users break junk food habits through photo logging, streak tracking, and AI-powered motivation.

## Features

### Core Features
- **User Authentication**: Email/password signup and login
- **Photo Logging**: Camera integration with guilt/regret ratings and calorie estimation
- **Streak Tracking**: Clean day counting with streak broken animations
- **Dashboard**: Personal stats, wall of shame, and progress overview
- **AI Coach Chat**: Motivational messages and interactive coaching
- **Progress Tracking**: Charts, weekly trends, and insights
- **Community**: Anonymous confessions, achievements, and leaderboard

### Technical Features
- Cross-platform (iOS/Android/Web)
- Offline data storage with AsyncStorage
- Camera and photo library access
- Location tracking
- Animated UI components
- Chart visualization
- Push notifications ready

## Installation

```bash
cd mobile
npm install
npm start
```

## Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── src/
│   ├── screens/           # All app screens
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LogScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── CommunityScreen.tsx
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx
│   └── services/          # External services
│       └── aiService.ts
├── assets/                # Images and static files
└── package.json
```

## Current Status

- Complete UI implementation for all 5 screens
- Full authentication flow
- Local data persistence
- Camera integration
- AI coaching system (mock responses)
- Progress tracking with charts
- Community features

## Next Steps for Production

1. **Backend Integration**
   - Replace mock authentication with Firebase Auth
   - Set up Firestore for data persistence
   - Configure Firebase Storage for photos

2. **AI Integration**
   - Add OpenRouter API key
   - Implement real AI responses
   - Add usage tracking

3. **Push Notifications**
   - Daily check-in reminders
   - Streak milestone celebrations
   - Motivational messages

4. **Advanced Features**
   - Social features (friend connections)
   - Custom achievements
   - Data export/import
   - Offline sync

## Environment Variables Needed

```
OPENROUTER_API_KEY=your_api_key_here
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
```