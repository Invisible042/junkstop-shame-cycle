import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';
import { Video, ResizeMode } from 'expo-av';
import { JunkFood3DScene } from '../components/JunkFood3DScene';
import { useTheme } from '../contexts/ThemeContext';
import LevelProgress from '../components/LevelProgress';
import GamificationService from '../services/GamificationService';
import AchievementBadge from '../components/AchievementBadge';
import { isDemoMode, getDemoData } from '../utils/demoData';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  streak_count: number;
  best_streak: number;
  total_saved: number;
  avg_guilt_score: number;
  total_logs: number;
  created_at: string;
}

interface JunkFoodItem {
  id: string;
  name: string;
  category: string;
  shameRating: number;
  guiltRating: number;
  timestamp: Date;
  notes?: string;
  photo?: string;
}

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string>('');
  const [foodItems, setFoodItems] = useState<JunkFoodItem[]>([]);
  const { theme } = useTheme();
  const [timeSinceLastLog, setTimeSinceLastLog] = useState('');
  const [streakDuration, setStreakDuration] = useState('');
  const [timer, setTimer] = useState({ h: '00', m: '00', s: '00', ms: '00' });
  const [streakActive, setStreakActive] = useState(false);
  const [streakStart, setStreakStart] = useState<Date | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [levelInfo, setLevelInfo] = useState({ level: 1, currentXP: 0, xpToNextLevel: 100, totalXP: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const gamificationService = GamificationService.getInstance();
  const cleanDaysProgressAnim = useRef(new Animated.Value(0)).current;

  const MOTIVATIONS = [
    "Every streak is progress! Ready to start again?",
    "Small steps lead to big changes. You’ve got this!",
    "One slip doesn’t define you. Keep moving forward!",
    "Celebrate your wins, learn from your slips.",
    "You’re building a healthier you, one choice at a time.",
    "Progress, not perfection. Be kind to yourself!",
    "Your journey matters. Every day is a new chance.",
    "You’re stronger than your cravings!",
    "Consistency beats intensity. Keep going!",
    "You’re not alone—your future self thanks you!"
  ];

  // Helper to format time difference
  function formatTimeSince(date: Date) {
    const now = new Date();
    let diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    return `${Math.floor(diff / 86400)}d ${Math.floor((diff % 86400) / 3600)}h`;
  }

  // Helper to pad numbers
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0');

  // Start streak handler
  const handleStartStreak = () => {
    setStreakActive(true);
    const now = new Date();
    setStreakStart(now);
    // Optionally, call backend to record streak start
  };

  // End streak handler
  const handleEndStreak = () => {
    setStreakActive(false);
    setStreakStart(null);
    setTimer({ h: '00', m: '00', s: '00', ms: '00' });
    const randomMsg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    Alert.alert('AI Motivation', randomMsg);
    // Optionally, call backend to record streak end
  };

  // Auto-end streak on log
  useEffect(() => {
    if (streakActive && foodItems.length > 0) {
      // If a new log is added after streak started, end streak
      if (streakStart && foodItems.some(item => item.timestamp > streakStart)) {
        handleEndStreak();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodItems]);

  // Timer effect
  useEffect(() => {
    if (streakActive && streakStart) {
      timerInterval.current && clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - streakStart.getTime();
        const ms = Math.floor((diff % 1000) / 10);
        const s = Math.floor((diff / 1000) % 60);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const h = Math.floor(diff / (1000 * 60 * 60));
        setTimer({ h: pad(h), m: pad(m), s: pad(s), ms: pad(ms) });
      }, 50);
    } else {
      timerInterval.current && clearInterval(timerInterval.current);
      setTimer({ h: '00', m: '00', s: '00', ms: '00' });
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [streakActive, streakStart]);

  // Update time since last log every second
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (foodItems.length > 0) {
      const lastLog = foodItems.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
      setTimeSinceLastLog(formatTimeSince(lastLog.timestamp));
      interval = setInterval(() => {
        setTimeSinceLastLog(formatTimeSince(lastLog.timestamp));
      }, 1000);
    } else {
      setTimeSinceLastLog('No logs yet');
    }
    return () => interval && clearInterval(interval);
  }, [foodItems]);

  // Calculate streak duration (days/hours)
  useEffect(() => {
    if (profile && profile.streak_count > 0 && foodItems.length > 0) {
      // Find the first log in the current streak (assume streak = consecutive days with no junk food missed)
      // For simplicity, use the oldest log in the streak as the start
      // (In a real app, backend should provide streak start timestamp)
      const sorted = [...foodItems].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const streakStart = sorted[0].timestamp;
      setStreakDuration(formatTimeSince(streakStart));
    } else {
      setStreakDuration('—');
    }
  }, [profile, foodItems]);

  const fetchProfile = async () => {
    try {
      if (isDemoMode()) {
        // Use demo data for presentation
        setProfile(getDemoData('user') as UserProfile);
        setFoodItems(getDemoData('logs') as JunkFoodItem[]);
        setLevelInfo(getDemoData('level') as any);
        const insights = getDemoData('insights') as string[];
        setDailyInsight(insights[0] || 'You\'re doing great! Keep up the good work.');
        setIsLoading(false);
        return;
      }

      const profileData = await apiRequest('/api/user/profile');
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to demo data if API fails
      if (isDemoMode()) {
        setProfile(getDemoData('user') as UserProfile);
        setFoodItems(getDemoData('logs') as JunkFoodItem[]);
        setLevelInfo(getDemoData('level') as any);
        const insights = getDemoData('insights') as string[];
        setDailyInsight(insights[0] || 'You\'re doing great! Keep up the good work.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyInsight = async () => {
    try {
      const insightData = await apiRequest('/api/ai/daily-insight?max_tokens=40');
      setDailyInsight(insightData.insight);
    } catch (error) {
      console.error('Failed to fetch insight:', error);
    }
  };

  const updateLevelInfo = () => {
    // Update gamification service with real user data
    if (profile && foodItems.length > 0) {
      const userStats = {
        totalLogs: foodItems.length,
        currentStreak: profile.streak_count,
        bestStreak: profile.best_streak,
        totalSaved: profile.total_saved,
        totalCaloriesAvoided: foodItems.length * 300, // Estimate
        averageGuiltScore: profile.avg_guilt_score,
        joinDate: new Date(profile.created_at),
      };
      
      // Update the gamification service with real data
      gamificationService.updateStats(userStats);
    }
    
    const totalXP = gamificationService.getTotalXP();
    const levelData = gamificationService.calculateLevel(totalXP);
    setLevelInfo(levelData);
  };

  const loadFoodItems = async () => {
    try {
      console.log('Loading food items...');
      const logs = await apiRequest('/api/logs?limit=1000');
      console.log('Logs received:', logs);
      
      const convertedItems: JunkFoodItem[] = logs.map((log: any) => ({
        id: log.id.toString(),
        name: log.food_type,
        category: 'Junk Food',
        shameRating: log.guilt_rating,
        guiltRating: log.regret_rating,
        timestamp: new Date(log.created_at),
        notes: log.location,
        photo: log.photo_url
      }));
      
      console.log('Converted items:', convertedItems);
      setFoodItems(convertedItems);
    } catch (error) {
      console.log('Could not load food items:', error);
      setFoodItems([]);
    }
  };

  const handleFoodItemClick = (food: JunkFoodItem) => {
    Alert.alert(
      food.name,
      `Shame: ${food.shameRating}/10\nGuilt: ${food.guiltRating}/10\n\n${food.notes || 'No notes'}`,
      [{ text: 'OK' }]
    );
  };

  const incrementStreak = async () => {
    try {
      const result = await apiRequest('/api/streak/increment', {
        method: 'POST',
      });
      setProfile(prev => prev ? {
        ...prev,
        streak_count: result.streak_count,
        best_streak: result.best_streak
      } : null);
      Alert.alert('Great job!', 'Your streak has been incremented!');
    } catch (error) {
      Alert.alert('Error', 'Failed to increment streak');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchDailyInsight(), loadFoodItems()]);
    updateLevelInfo();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchDailyInsight();
    loadFoodItems();
  }, []);

  // Animate clean days progress bar
  useEffect(() => {
    const cleanDaysPercent = getCleanDaysPercent();
    Animated.timing(cleanDaysProgressAnim, {
      toValue: cleanDaysPercent / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [foodItems, cleanDaysProgressAnim]);

  const getMotivationalMessage = (streakCount: number) => {
    if (streakCount === 0) return "Start your journey today!";
    if (streakCount < 7) return "Keep building momentum!";
    if (streakCount < 30) return "You're doing amazing!";
    return "You're a true champion!";
  };

  // Helper to truncate AI insight to 40 tokens (words)
  const truncateTokens = (text: string, maxTokens: number) => {
    if (!text) return '';
    const tokens = text.split(/\s+/);
    if (tokens.length <= maxTokens) return text;
    return tokens.slice(0, maxTokens).join(' ') + '...';
  };

  // Helper to calculate clean days percentage for Progress Preview
  function getCleanDaysPercent() {
    // Assume a clean day is a day with 0 high-regret logs
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekAgo);
      d.setDate(weekAgo.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    const logsByDay = days.map(dateStr =>
      foodItems.filter(f => f.timestamp.toISOString().slice(0, 10) === dateStr)
    );
    const cleanDays = logsByDay.filter(dayLogs => dayLogs.filter(f => f.guiltRating >= 4).length === 0).length;
    return Math.round((cleanDays / 7) * 100);
  }

  // Helper to get today's logs count
  function getTodayLogsCount() {
    if (isDemoMode()) {
      // In demo mode, get from demo data
      const demoLogs = getDemoData('logs');
      const today = new Date().toISOString().slice(0, 10);
      return demoLogs.filter((f: any) => {
        const logDate = f.timestamp instanceof Date ? f.timestamp.toISOString().slice(0, 10) : new Date(f.timestamp).toISOString().slice(0, 10);
        return logDate === today;
      }).length;
    }
    const today = new Date().toISOString().slice(0, 10);
    return foodItems.filter(f => f.timestamp.toISOString().slice(0, 10) === today).length;
  }

  // Helper to get today's high regret count
  function getTodayHighRegretCount() {
    if (isDemoMode()) {
      // In demo mode, get from demo data
      const demoLogs = getDemoData('logs');
      const today = new Date().toISOString().slice(0, 10);
      return demoLogs.filter((f: any) => {
        const logDate = f.timestamp instanceof Date ? f.timestamp.toISOString().slice(0, 10) : new Date(f.timestamp).toISOString().slice(0, 10);
        return logDate === today && (f.guiltRating || f.shameRating) >= 4;
      }).length;
    }
    const today = new Date().toISOString().slice(0, 10);
    return foodItems.filter(f => f.timestamp.toISOString().slice(0, 10) === today && f.guiltRating >= 4).length;
  }

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Fixed Greeting Header */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: theme.background, paddingTop: 40, paddingBottom: 16, paddingHorizontal: 16, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, shadowColor: '#009e60', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, textAlign: 'left', letterSpacing: 1 }}>Hey Danny 👋</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
                      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 100, paddingBottom: 32 }}>
          {/* Timer and Streak Controls in a Card */}
          <LinearGradient
            colors={['#fff2f2', '#e0f7fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              { borderRadius: 18, marginBottom: 18, padding: 18, shadowColor: '#009e60', shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: 'rgba(119,190,240,0.12)' },
              theme.cardShadow,
            ]}
          >
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Streak Timer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.accent, fontVariant: ['tabular-nums'] }}>{timer.h}</Text>
            <Text style={{ fontSize: 28, color: theme.text, marginHorizontal: 2 }}>:</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.accent, fontVariant: ['tabular-nums'] }}>{timer.m}</Text>
            <Text style={{ fontSize: 28, color: theme.text, marginHorizontal: 2 }}>:</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.accent, fontVariant: ['tabular-nums'] }}>{timer.s}</Text>
            <Text style={{ fontSize: 24, color: theme.text, marginHorizontal: 2 }}>:</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.accent, fontVariant: ['tabular-nums'] }}>{timer.ms}</Text>
          </View>
          {!streakActive ? (
            <TouchableOpacity style={{ backgroundColor: theme.accent, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 32, marginTop: 6 }} onPress={handleStartStreak}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Start Streak</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={{ backgroundColor: '#f87171', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 32, marginTop: 6 }} onPress={handleEndStreak}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>End Streak</Text>
            </TouchableOpacity>
          )}
                  </LinearGradient>
        
        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <LinearGradient
            colors={['#fff2f2', '#e0f7fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              { flex: 1, borderRadius: 22, padding: 18, marginRight: 6, shadowColor: '#009e60', shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: 'rgba(119,190,240,0.12)' },
              theme.cardShadow,
            ]}
          >
            <Text style={{ fontSize: 28, marginBottom: 2 }}>🍔</Text>
            <Text style={{ fontSize: 18, color: theme.text, fontWeight: 'bold', marginBottom: 4 }}>{getTodayLogsCount()}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 15 }}>junk foods logged today</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#fff2f2', '#e0f7fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              { flex: 1, borderRadius: 22, padding: 18, marginLeft: 6, shadowColor: '#009e60', shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: 'rgba(119,190,240,0.12)' },
              theme.cardShadow,
            ]}
          >
            <Text style={{ fontSize: 28, marginBottom: 2 }}>😟</Text>
            <Text style={{ fontSize: 18, color: theme.text, fontWeight: 'bold', marginBottom: 4 }}>{getTodayHighRegretCount()}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 15 }}>high regret today</Text>
          </LinearGradient>
          </View>
        {/* Level/XP Status */}
        <View style={[{ borderRadius: 18, backgroundColor: theme.cardBg, marginBottom: 16, padding: 18 }, theme.cardShadow]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 18, color: theme.text, fontWeight: 'bold' }}>Level {levelInfo.level} • {levelInfo.totalXP} XP</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>Keep going! You're doing great!</Text>
            </View>
            <View style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 25, 
              backgroundColor: '#FFD700', 
              justifyContent: 'center', 
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#F59E0B'
            }}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Preview - Clean Days Bar in a Card */}
        <LinearGradient
          colors={['#fff2f2', '#e0f7fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { borderRadius: 18, marginBottom: 16, padding: 18, shadowColor: '#009e60', shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: 'rgba(119,190,240,0.12)' },
            theme.cardShadow,
          ]}
        >
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Clean Days This Week</Text>
          <View style={{ width: 220, height: 22, borderRadius: 12, backgroundColor: '#e0e7ff', overflow: 'hidden', justifyContent: 'center', marginBottom: 4 }}>
            <Animated.View style={{
              width: cleanDaysProgressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              height: 22,
              backgroundColor: getCleanDaysPercent() >= 70 ? '#4caf50' : getCleanDaysPercent() >= 40 ? '#ff9800' : '#f44336',
              borderRadius: 12,
              position: 'absolute',
              left: 0,
              top: 0,
            }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center', width: '100%', zIndex: 2 }}>{getCleanDaysPercent()}% clean</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>A clean day = no high-regret logs</Text>
        </LinearGradient>
        {/* AI Insight Card (scrollable, just beneath Clean Days card) */}
        <LinearGradient
          colors={['#fff2f2', '#e0f7fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { borderRadius: 18, marginBottom: 16, padding: 18, shadowColor: '#009e60', shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: 'rgba(119,190,240,0.12)' },
            theme.cardShadow,
          ]}
        >
          <Text style={{ fontSize: 16, color: theme.text, fontWeight: 'bold', marginBottom: 8 }}>AI Insight</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 15 }}>{dailyInsight || 'Stay mindful and keep making progress! Your daily insight will appear here.'}</Text>
        </LinearGradient>
        <TouchableOpacity
          style={{
            backgroundColor: '#e74c3c',
            borderRadius: 24,
            paddingVertical: 18,
            marginVertical: 10,
            alignItems: 'center' as const,
            ...theme.cardShadow,
          }}
          onPress={() => navigation.navigate('Log')}
        >
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: theme.fontFamily, letterSpacing: 0.5, textAlign: 'center' }}>Log New Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={theme.outlineButton} onPress={() => navigation.navigate('Chat')}>
          <Text style={{ color: theme.accent, fontWeight: 700, fontSize: 16, fontFamily: theme.fontFamily, letterSpacing: 0.5, textAlign: 'center' }}>Chat with Coach</Text>
        </TouchableOpacity>
        

        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  usernameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  motivationalText: {
    fontSize: 14,
    color: '#ffd700',
    marginTop: 5,
  },
  incrementButton: {
    backgroundColor: '#4caf50',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  incrementText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 5,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  bestStreakIcon: {
    color: '#ffd700',
  },
  moneySavedIcon: {
    color: '#4caf50',
  },
  totalLogsIcon: {
    color: '#2196f3',
  },
  avgGuiltIcon: {
    color: '#ff9800',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  insightText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButton: {
    backgroundColor: '#e74c3c',
  },
  chatButton: {
    backgroundColor: '#9b59b6',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});