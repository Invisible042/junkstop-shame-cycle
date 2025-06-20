# Mobile Development Workflow

This document outlines how to develop and test the React Native JunkStop app.

## Development Options

### Option 1: Expo Go (Recommended for Testing)
1. Install Expo Go app on your phone
2. Run `cd mobile && npm start`
3. Scan QR code with camera (iOS) or Expo Go app (Android)

### Option 2: Web Development
1. Run `cd mobile && npm run web`
2. Opens in browser at localhost:19006
3. Good for UI development and testing

### Option 3: Local Simulators
- iOS Simulator (Mac only): `npm run ios`
- Android Emulator: `npm run android`

## Key Features Implemented

### Authentication System
- Mock authentication for development
- AsyncStorage for session persistence
- Email/password validation

### Photo Logging
- Camera integration with expo-image-picker
- Photo selection from gallery
- Guilt/regret rating sliders
- Calorie estimation selection
- Cost input (optional)

### Data Management
- Local storage with AsyncStorage
- Context-based state management
- Automatic streak calculation
- Weekly statistics

### AI Coaching
- Pattern-based responses
- User behavior analysis
- Motivational message generation
- Interactive chat interface

### Progress Tracking
- Daily and weekly charts
- Streak visualization
- Achievement system
- Insight generation

### Community Features
- Anonymous confessions
- Achievement badges
- Global leaderboard
- Social interactions

## Testing Checklist

- [ ] Authentication flow (signup/login/logout)
- [ ] Camera permissions and photo capture
- [ ] Photo selection from gallery
- [ ] Rating sliders functionality
- [ ] Data persistence across app restarts
- [ ] Streak calculation accuracy
- [ ] Chart rendering with real data
- [ ] AI chat responses
- [ ] Community post creation
- [ ] Achievement progress tracking
- [ ] Navigation between all screens
- [ ] Responsive design on different screen sizes

## Production Deployment

When ready for production:
1. Configure Firebase project
2. Add real API keys to app.json
3. Build with `expo build`
4. Submit to app stores via Expo or EAS Build