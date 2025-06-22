# JunkStop - Junk Food Accountability App

A comprehensive mobile-first web application that helps users stop eating junk food through accountability, AI coaching, and community support.

## 🎯 Features

### Core Functionality
- **Junk Food Logging**: Take photos and log junk food consumption with guilt/regret ratings
- **Streak Tracking**: Monitor clean eating streaks and personal bests
- **Cost Tracking**: Track money spent on junk food to visualize financial impact
- **Calorie Estimation**: AI-powered calorie estimation for logged items

### AI Coach
- **Personalized Motivation**: AI-generated motivational messages based on your patterns
- **Pattern Analysis**: Daily insights about your eating behaviors
- **Smart Coaching**: Contextual advice based on guilt/regret levels

### Community Support
- **Anonymous Sharing**: Share struggles and victories with the community
- **Peer Support**: See others' journeys for motivation and accountability
- **Achievement System**: Unlock badges for milestones and streaks

### Accountability Features
- **Progress Analytics**: Weekly breakdowns of consumption patterns
- **Visual Progress**: Charts and graphs showing improvement over time
- **Goal Setting**: Set and track personal junk food reduction goals

## 🏗 Architecture

### Backend (FastAPI)
- **Authentication**: JWT-based user authentication with demo account
- **Database**: PostgreSQL with proper relationships and constraints
- **AI Integration**: OpenRouter API for coaching and calorie estimation
- **Image Storage**: Local file system for photo uploads
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

### Frontend (React Native/Expo)
- **Cross-Platform**: Works on iOS, Android, and Web
- **Modern UI**: Clean, dark-themed interface optimized for mobile
- **Navigation**: Tab-based navigation with stack navigation
- **State Management**: React Query for server state, Context for auth

### Database Schema
```sql
users (id, email, username, password_hash, streak_count, best_streak, total_guilt_score, created_at)
junk_food_logs (id, user_id, photo_url, food_type, guilt_rating, regret_rating, estimated_cost, estimated_calories, location, created_at)
achievements (id, user_id, badge_type, badge_name, description, earned_date)
community_posts (id, user_id, content, photo_url, is_anonymous, likes_count, created_at)
ai_insights (id, user_id, insight_text, insight_type, generated_date)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL database (provided by Replit)

### Quick Start
```bash
# Install dependencies and start both frontend and backend
npm run dev

# Or run individually:
npm run backend    # Start FastAPI server on port 5000
npm run frontend   # Start Expo development server
npm run web        # Start web version of mobile app
```

### Demo Account
- **Email**: demo@junkstop.com
- **Password**: password

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password

### User Management
- `GET /api/user/profile` - Get user profile and stats
- `POST /api/streak/increment` - Increment user's clean eating streak

### Junk Food Logging
- `POST /api/logs` - Create new junk food log entry with photo
- `GET /api/logs` - Get user's junk food logs with pagination

### Analytics & Progress
- `GET /api/analytics/weekly` - Get weekly consumption analytics
- `GET /api/ai/daily-insight` - Get AI-generated daily insight
- `POST /api/ai/chat` - Chat with AI coach

### Community
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create new community post

## 🎨 Mobile App Structure

```
mobile/src/
├── screens/           # App screens
│   ├── AuthScreen.tsx       # Login/Register
│   ├── DashboardScreen.tsx  # Main dashboard with stats
│   ├── LogJunkFoodScreen.tsx # Log new junk food entry
│   ├── ProgressScreen.tsx   # Analytics and progress
│   ├── CommunityScreen.tsx  # Community feed
│   └── ChatScreen.tsx       # AI coach chat
├── navigation/        # App navigation
│   ├── AppNavigator.tsx     # Main navigation structure
│   └── MainTabNavigator.tsx # Tab navigation
├── contexts/          # React contexts
│   └── AuthContext.tsx      # Authentication state
└── utils/
    └── api.ts              # API client and types
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `OPENROUTER_API_KEY` - OpenRouter API key for AI features (optional)
- `JWT_SECRET` - Secret key for JWT token signing (auto-generated)

### Database Setup
The database is automatically configured with Replit's PostgreSQL service. Tables are created on first startup.

### AI Features
AI coaching works with fallback responses if no API key is provided. For enhanced AI features, add your OpenRouter API key.

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Pydantic models for request validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **File Upload Security**: Validated image uploads with size limits

## 📱 Mobile Features

- **Camera Integration**: Take photos directly in the app
- **Photo Gallery**: Select images from device gallery  
- **Offline Support**: Basic functionality works offline
- **Push Notifications**: Achievement and reminder notifications
- **Responsive Design**: Optimized for all screen sizes
- **Dark Theme**: Eye-friendly dark interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For technical support or feature requests, please create an issue in the repository or contact the development team.

---

**JunkStop** - Your journey to healthier eating starts with awareness. Log it, own it, stop it.