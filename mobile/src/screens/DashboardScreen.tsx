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
      const insightData = await apiRequest('/api/ai/daily-insight');
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.usernameText}>{user?.username || 'User'}!</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: 12 }}>
            <Ionicons name="settings-outline" size={26} color="#8e44ad" />
          </TouchableOpacity>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{profile?.streak_count || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
            <Text style={styles.motivationalText}>
              {getMotivationalMessage(profile?.streak_count || 0)}
            </Text>
          </View>
          <TouchableOpacity style={styles.incrementButton} onPress={incrementStreak}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.incrementText}>Mark Clean Day</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#ffd700" />
          <Text style={styles.statNumber}>{profile?.best_streak || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#4caf50" />
          <Text style={styles.statNumber}>${profile?.total_saved?.toFixed(0) || '0'}</Text>
          <Text style={styles.statLabel}>Money Saved</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="journal" size={24} color="#2196f3" />
          <Text style={styles.statNumber}>{profile?.total_logs || 0}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="analytics" size={24} color="#ff9800" />
          <Text style={styles.statNumber}>{profile?.avg_guilt_score?.toFixed(1) || '0'}</Text>
          <Text style={styles.statLabel}>Avg Guilt</Text>
        </View>
      </View>

      {dailyInsight && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={20} color="#ffd700" />
            <Text style={styles.insightTitle}>Today's Insight</Text>
          </View>
          <Text style={styles.insightText}>{dailyInsight}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.logButton]}
          onPress={() => navigation.navigate('LogJunkFood')}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Log Junk Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.chatButton]}
          onPress={() => navigation.navigate('Chat')}
        >
          <Ionicons name="chatbubbles" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Get Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    fontSize: 14,
    color: '#666',
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