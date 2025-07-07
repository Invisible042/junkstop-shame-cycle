import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';
import { Video, ResizeMode } from 'expo-av';

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

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string>('');

  const fetchProfile = async () => {
    try {
      const profileData = await apiRequest('/api/user/profile');
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
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
    await Promise.all([fetchProfile(), fetchDailyInsight()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchDailyInsight();
  }, []);

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ ...styles.header, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.usernameText}>{user?.username || 'User'}!</Text>
        </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: 12 }}>
            <Ionicons name="settings-outline" size={26} color={colors.accent} />
          </TouchableOpacity>
        </View>
        {/* AI Insights Card */}
        <View style={[cardStyle, { marginTop: spacing.xs, marginBottom: spacing.sm, backgroundColor: colors.lightGray, borderColor: colors.border, borderWidth: 1, alignItems: 'center', padding: spacing.md }]}> 
          <Text style={{ color: colors.green, fontWeight: 'bold', marginBottom: spacing.xs, fontSize: fontSizes.body }}>
            <Ionicons name="sparkles-outline" size={16} color={colors.green} /> AI Insight
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small, marginBottom: spacing.xs, fontStyle: 'italic' }}>
            Personalized for you
          </Text>
          <Text style={{ color: colors.text, fontSize: fontSizes.body, textAlign: 'center', marginTop: spacing.xs }}>
            {dailyInsight ? truncateTokens(dailyInsight, 40) : 'No insight available today.'}
          </Text>
        </View>
        {/* End AI Insights Card */}
        <View style={[cardStyle, { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.lightGray }]}> 
          <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small, marginBottom: spacing.xs }}>Days Clean</Text>
          <Text style={{ color: colors.text, fontSize: 40, fontWeight: 'bold', marginBottom: spacing.xs }}>{profile?.streak_count || 0}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <View style={[cardStyle, { flex: 1, marginRight: spacing.xs, alignItems: 'center', padding: spacing.sm, backgroundColor: colors.lightGray }]}> 
            <Text style={{ color: colors.green, fontSize: 24, fontWeight: 'bold' }}>${profile?.total_saved?.toFixed(0) || '0'}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small }}>Money Saved</Text>
        </View>
          <View style={[cardStyle, { flex: 1, marginLeft: spacing.xs, alignItems: 'center', padding: spacing.sm, backgroundColor: colors.lightGray }]}> 
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>{profile?.avg_guilt_score?.toFixed(1) || '0'}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small }}>Avg Guilt Score</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.sm, marginBottom: spacing.sm }]}
          onPress={() => navigation.navigate('LogJunkFood')}
        >
          <Ionicons name="camera" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fontSizes.body }}>Log Junk Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
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