# JunkStop Mobile App

A React Native + Expo mobile application for tracking junk food habits and building healthier eating patterns.

## Quick Start

```bash
# Start development server (web interface)
npm start

# Run on specific platforms
npm run mobile   # QR code for mobile devices
npm run android  # Android emulator
npm run ios      # iOS simulator
```

## Project Structure

```
mobile/                 # React Native + Expo app
├── src/
│   ├── screens/       # App screens (Dashboard, Log, Progress, etc.)
│   ├── context/       # State management (Auth, Data)
│   ├── services/      # External services (Firebase, AI, Notifications)
│   ├── hooks/         # Custom React hooks
│   └── config/        # Configuration files
├── App.tsx            # Main app component
├── app.config.js      # Expo configuration
├── eas.json          # EAS build configuration
└── package.json       # Dependencies and scripts
```

## Features

- **Photo Logging**: Camera integration for junk food tracking
- **Streak Tracking**: Automatic clean day calculation
- **AI Coaching**: Motivational messages based on eating patterns
- **Progress Charts**: Visual tracking of habits over time
- **Community**: Anonymous confessions and achievements
- **Push Notifications**: Daily reminders and milestone celebrations
- **Settings**: Comprehensive app configuration

## Production Setup

1. **Firebase Configuration**:
   - Create Firebase project
   - Enable Authentication, Firestore, and Storage
   - Add credentials to `.env`

2. **AI Integration**:
   - Get OpenRouter API key
   - Add to environment variables

3. **Build for Production**:
   ```bash
   npx eas build --platform all
   ```

## Environment Variables

Copy `mobile/.env.example` to `mobile/.env` and configure:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
```

## MVP Status

✅ Complete production-ready mobile app
✅ Real authentication and cloud storage
✅ AI-powered coaching system
✅ Push notifications
✅ Offline functionality with sync
✅ App store ready configuration

Ready for beta testing and app store submission!