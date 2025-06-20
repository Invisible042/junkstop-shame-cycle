import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { currentStreak, bestStreak, logs, getWeekStats } = useData();
  const { user, signOut } = useAuth();
  const weekStats = getWeekStats();

  const recentLogs = logs
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  return (
    <LinearGradient
      colors={['#7C3AED', '#3B82F6', '#1E40AF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.displayName}</Text>
              <Text style={styles.subtitle}>Stay strong today</Text>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={32} color="#F59E0B" />
              <Text style={styles.streakTitle}>Clean Streak</Text>
            </View>
            <Text style={styles.streakDays}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>
              {currentStreak === 1 ? 'day' : 'days'} clean
            </Text>
            <Text style={styles.bestStreak}>Best: {bestStreak} days</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="sad-outline" size={24} color="#EF4444" />
              <Text style={styles.statValue}>{weekStats.avgGuilt.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Guilt</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="restaurant-outline" size={24} color="#F97316" />
              <Text style={styles.statValue}>{weekStats.totalCalories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Text style={styles.statValue}>${weekStats.totalCost.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{weekStats.frequency}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* Wall of Shame */}
          {recentLogs.length > 0 && (
            <View style={styles.shameSection}>
              <Text style={styles.sectionTitle}>Wall of Shame</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.shameGrid}>
                  {recentLogs.map((log) => (
                    <View key={log.id} style={styles.shameCard}>
                      <Image source={{ uri: log.photoUri }} style={styles.shameImage} />
                      <View style={styles.shameOverlay}>
                        <Text style={styles.shameGuilt}>Guilt: {log.guiltRating}/10</Text>
                        <Text style={styles.shameDate}>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.actionText}>Log Junk Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trending-up" size={24} color="white" />
              <Text style={styles.actionText}>View Progress</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  streakCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  streakDays: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 18,
    color: '#E2E8F0',
    marginTop: 8,
  },
  bestStreak: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
  },
  shameSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  shameGrid: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  shameCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  shameImage: {
    width: '100%',
    height: '100%',
  },
  shameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  shameGuilt: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  shameDate: {
    color: '#E2E8F0',
    fontSize: 8,
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});