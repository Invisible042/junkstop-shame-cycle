# JunkStop Gamification Testing Guide

## 🎮 Overview

This guide explains how to test the gamification system quickly without waiting days for achievements to unlock, and how to use the new "Next Badge Progress" feature.

## ✨ New Features Added

### 1. Next Badge Progress Display
- **Location**: Progress Screen → Analytics Tab
- **Shows**: How many days/logs needed for next achievement
- **Features**: 
  - Progress bars for each achievement type
  - Motivational messages
  - Real-time updates

### 2. Test Endpoints for Quick Testing
- **Purpose**: Test gamification without waiting days
- **Available**: Only in development mode
- **Authentication**: Requires user login

## 🚀 Quick Start Testing

### Option 1: Use the Test Script (Recommended)

1. **Start your backend server**:
   ```bash
   cd apps/backend
   python main.py
   ```

2. **Run the test script**:
   ```bash
   python test_gamification.py
   ```

3. **Check your mobile app**:
   - Open the Progress screen
   - Go to Analytics tab
   - See the "Next Badge Progress" section

### Option 2: Manual API Testing

#### Prerequisites
- Backend server running on `localhost:5000`
- User account created
- Access token (login first)

#### Test Endpoints

**1. Reset User Data**
```bash
curl -X GET "http://localhost:5000/api/test/gamification/reset-user" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Simulate Streak**
```bash
curl -X POST "http://localhost:5000/api/test/gamification/simulate-streak" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'
```

**3. Simulate Logs**
```bash
curl -X POST "http://localhost:5000/api/test/gamification/simulate-logs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

**4. Add XP**
```bash
curl -X POST "http://localhost:5000/api/test/gamification/add-xp" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

**5. Unlock Achievement Manually**
```bash
curl -X POST "http://localhost:5000/api/test/gamification/unlock-achievement" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"achievement_id": "first_day"}'
```

## 🏆 Achievement Types & Testing

### Streak Achievements
- **First Step**: 1 day streak
- **Getting Started**: 3 day streak  
- **Week Warrior**: 7 day streak
- **Month Master**: 30 day streak
- **Century Club**: 100 day streak

**Test with**: `simulate-streak` endpoint

### Milestone Achievements
- **Honest Logger**: 1 log
- **Transparency**: 10 logs
- **Self-Awareness**: 100 logs
- **Money Saver**: $100 saved
- **Calorie Conscious**: 10,000 calories avoided

**Test with**: `simulate-logs` endpoint

### Social Achievements
- **Community Member**: First post
- **Supportive Friend**: 10 likes given
- **Inspiration**: 10 likes received

**Test with**: Manual unlock or actual community interaction

## 📱 Mobile App Features

### Next Badge Progress Section
The new section shows:

1. **Achievement Icon & Title**: Visual representation
2. **Motivational Message**: "Stay clean for X more days to earn 'Achievement Name'!"
3. **Progress Bar**: Visual progress indicator
4. **Progress Text**: "Current/Max" format

### Example Display
```
🏆 Next Badge Progress
   📈 Week Warrior
   Stay clean for 3 more days to earn 'Week Warrior'!
   ████████░░ 4/7
```

## 🔧 Technical Details

### Frontend Changes
- **File**: `mobile/src/screens/ProgressScreen.tsx`
- **New Function**: `getNextBadgeProgress()`
- **New Styles**: Progress bar and badge display styles
- **Integration**: Uses existing `GamificationService`

### Backend Changes
- **File**: `apps/backend/main.py`
- **New Endpoints**: 5 test endpoints under `/api/test/gamification/`
- **Database**: Updates user stats and achievements
- **Security**: Requires authentication

### Database Schema
The test endpoints work with existing tables:
- `users` (streak, logs, XP)
- `user_achievements` (unlocked achievements)

## 🎯 Testing Scenarios

### Scenario 1: New User Journey
1. Reset user data
2. Simulate 1 day streak → Should unlock "First Step"
3. Simulate 1 log → Should unlock "Honest Logger"
4. Check Progress screen for next achievements

### Scenario 2: Streak Progression
1. Reset user data
2. Simulate 3 day streak → Should unlock "Getting Started"
3. Simulate 7 day streak → Should unlock "Week Warrior"
4. Check progress bars update correctly

### Scenario 3: Level Progression
1. Reset user data
2. Add 50 XP → Check level calculation
3. Add 100 XP → Check level progression
4. Verify XP bar updates in mobile app

## 🐛 Troubleshooting

### Common Issues

**1. "Server not responding"**
- Ensure backend is running on port 5000
- Check firewall settings

**2. "Authentication failed"**
- Create test user first
- Check token expiration

**3. "Achievement not unlocking"**
- Check database connection
- Verify achievement IDs match
- Check user ID in database

**4. "Progress not updating in mobile app"**
- Refresh the Progress screen
- Check network connectivity
- Restart the mobile app

### Debug Commands

**Check user data**:
```bash
curl -X GET "http://localhost:5000/debug/logs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check achievements**:
```bash
curl -X GET "http://localhost:5000/api/achievements" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚨 Production Notes

### Security
- Test endpoints are for development only
- Remove or secure in production
- Add environment variable checks

### Performance
- Test endpoints bypass normal validation
- Use sparingly in production testing
- Monitor database performance

## 📈 Next Steps

1. **Test all scenarios** using the provided script
2. **Verify mobile app updates** correctly
3. **Check progress bars** animate smoothly
4. **Test edge cases** (0 progress, max progress)
5. **Remove test endpoints** before production deployment

---

**Happy Testing! 🎮✨** 