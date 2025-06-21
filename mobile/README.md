# JunkStop Mobile App

A complete React Native mobile application for junk food accountability and habit breaking.

## Features

- **Dashboard**: Track streaks, view stats, and get daily insights
- **Log Junk Food**: Take photos, rate guilt/regret levels, track costs
- **Progress Analytics**: View detailed charts and trends
- **AI Support Chat**: Get personalized motivation and support
- **Community**: Share experiences anonymously with other users

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Use Expo Go app on your phone or run on simulators:
```bash
npm run ios    # For iOS simulator
npm run android # For Android emulator
```

## API Configuration

The app connects to the FastAPI backend running on port 8000. Make sure the backend is running:

```bash
# From project root
python start_dev.py
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/         # Main app screens
│   │   ├── DashboardScreen.tsx
│   │   ├── LogJunkFoodScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── AuthScreen.tsx
│   ├── navigation/      # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   └── utils/          # Utilities
│       └── api.ts      # API client
├── App.tsx             # App entry point
└── package.json        # Dependencies
```

## Key Components

### Authentication
- Secure token-based authentication
- Persistent login state with AsyncStorage
- Mock login buttons for development

### Camera Integration
- Photo capture for junk food logging
- Image picker from gallery
- Photo upload to backend

### Real-time Data
- React Query for data fetching and caching
- Automatic refresh and sync
- Optimistic updates

### Native Features
- Push notifications (ready for implementation)
- Biometric authentication (ready for implementation)
- Offline support (ready for implementation)

## Development Notes

The mobile app is fully functional and mirrors the web app features:
- Complete CRUD operations for all data
- Real-time analytics and progress tracking
- AI-powered chat support
- Community features
- Photo upload and management

All screens are responsive and follow native mobile design patterns with smooth animations and intuitive navigation.