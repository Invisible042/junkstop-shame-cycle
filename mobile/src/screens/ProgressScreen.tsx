import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MoodBar from '../components/MoodBar';
import JunkCard from '../components/JunkCard';
import CoachFeedback from '../components/CoachFeedback';
import { useTheme } from '../contexts/ThemeContext';
import LevelProgress from '../components/LevelProgress';
import GamificationService from '../services/GamificationService';
import AchievementBadge from '../components/AchievementBadge';
import { getAchievementById } from '../data/achievements';
import { isDemoMode, getDemoData } from '../utils/demoData';
import { textStyles } from '../styles/fonts';

interface WeeklyAnalytics {
  total_logs: number;
  avg_guilt_score: number;
  avg_regret_score: number;
  total_cost: number;
  total_calories: number;
  daily_breakdown: Array<{
    date: string;
    count: number;
    avg_guilt: number;
    avg_regret: number;
    total_cost: number;
    total_calories: number;
  }>;
  streak_count: number;
  best_streak: number;
}

interface JunkFoodLog {
  id: number;
  photo_url: string;
  food_type: string;
  guilt_rating: number;
  regret_rating: number;
  estimated_cost: number;
  estimated_calories: number;
  location?: string;
  created_at: string;
  ai_motivation?: string;
}

export default function ProgressScreen() {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'analytics' | 'logs'>('analytics');
  const [levelInfo, setLevelInfo] = useState({ level: 1, currentXP: 0, xpToNextLevel: 100, totalXP: 0 });
  const gamificationService = GamificationService.getInstance();

  // Function to get next badge progress information
  const getNextBadgeProgress = () => {
    const lockedAchievements = gamificationService.getLockedAchievements();
    const userStats = gamificationService.getUserStats();
    
    // Find the next achievable badge for each category
    const nextBadges = {
      streak: lockedAchievements.find(a => a.type === 'streak'),
      milestone: lockedAchievements.find(a => a.type === 'milestone'),
      social: lockedAchievements.find(a => a.type === 'social'),
    };

    const progressInfo = [];
    
    // Streak progress
    if (nextBadges.streak && nextBadges.streak.maxProgress !== undefined) {
      const needed = nextBadges.streak.maxProgress - userStats.currentStreak;
      if (needed > 0) {
        progressInfo.push({
          type: 'streak',
          achievement: nextBadges.streak,
          needed,
          current: userStats.currentStreak,
          message: `Stay clean for ${needed} more day${needed > 1 ? 's' : ''} to earn '${nextBadges.streak.title}'!`
        });
      }
    }

    // Milestone progress (logs)
    if (nextBadges.milestone && nextBadges.milestone.id === 'first_log') {
      const needed = 1 - userStats.totalLogs;
      if (needed > 0) {
        progressInfo.push({
          type: 'milestone',
          achievement: nextBadges.milestone,
          needed,
          current: userStats.totalLogs,
          message: `Log ${needed} more time${needed > 1 ? 's' : ''} to earn '${nextBadges.milestone.title}'!`
        });
      }
    } else if (nextBadges.milestone && nextBadges.milestone.id === 'ten_logs') {
      const needed = 10 - userStats.totalLogs;
      if (needed > 0) {
        progressInfo.push({
          type: 'milestone',
          achievement: nextBadges.milestone,
          needed,
          current: userStats.totalLogs,
          message: `Log ${needed} more time${needed > 1 ? 's' : ''} to earn '${nextBadges.milestone.title}'!`
        });
      }
    }

    return progressInfo;
  };

  // Enhanced data fetching with better error handling
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ['weeklyAnalytics'],
    queryFn: () => {
      if (isDemoMode()) {
        return Promise.resolve({ data: getDemoData('analytics') });
      }
      return api.get('/api/analytics/weekly').then(res => res.data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const {
    data: recentLogsRaw,
    isLoading: logsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => {
      if (isDemoMode()) {
        return Promise.resolve({ data: getDemoData('logs') });
      }
      return api.get('/api/logs?limit=1000');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  // Enhanced data safety
  const recentLogs = Array.isArray(recentLogsRaw?.data) ? recentLogsRaw.data : [];
  const hasLogs = recentLogs && recentLogs.length > 0;

  // Enhanced refresh function with better error handling
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['weeklyAnalytics'] }),
        queryClient.invalidateQueries({ queryKey: ['recentLogs'] }),
      ]);
      
      // Update gamification service with real data
      if (analytics && recentLogs.length > 0) {
        const userStats = {
          totalLogs: recentLogs.length,
          currentStreak: analytics.streak_count,
          bestStreak: analytics.best_streak,
          totalSaved: analytics.total_cost,
          totalCaloriesAvoided: analytics.total_calories,
          averageGuiltScore: analytics.avg_guilt_score,
          joinDate: new Date(),
        };
        
        // Update the gamification service with real data
        gamificationService.updateStats(userStats);
      }
      
      // Update level info
      const totalXP = gamificationService.getTotalXP();
      const levelData = gamificationService.calculateLevel(totalXP);
      setLevelInfo(levelData);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (analyticsLoading || logsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading your progress...
        </Text>
      </View>
    );
  }

  // Error state
  if (analyticsError || logsError) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.accent} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>Oops! Something went wrong</Text>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          We couldn't load your progress data. Please try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: theme.background, paddingTop: 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="trending-up" size={32} color={theme.accent} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>PROGRESS</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Track Your Growth
            </Text>
          </View>
        </View>
      </View>

      {/* Enhanced Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.cardBg }]}>
        <TouchableOpacity
          onPress={() => setSelectedTab('analytics')}
          style={[
            styles.tabButton,
            selectedTab === 'analytics' && { backgroundColor: theme.accent }
          ]}
        >
          <Ionicons 
            name="bar-chart-outline" 
            size={20} 
            color={selectedTab === 'analytics' ? '#fff' : theme.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'analytics' ? '#fff' : theme.text }
          ]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('logs')}
          style={[
            styles.tabButton,
            selectedTab === 'logs' && { backgroundColor: theme.accent }
          ]}
        >
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={selectedTab === 'logs' ? '#fff' : theme.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'logs' ? '#fff' : theme.text }
          ]}>
            Recent Logs
          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'analytics' && (
          <>
            {/* Level Progress with Next Achievement */}
            <LevelProgress
              level={levelInfo.level}
              currentXP={levelInfo.currentXP}
              xpToNextLevel={levelInfo.xpToNextLevel}
              nextAchievement={(() => {
                const nextBadgeProgress = getNextBadgeProgress();
                if (nextBadgeProgress.length > 0) {
                  const progress = nextBadgeProgress[0];
                  return {
                    title: progress.achievement.title,
                    icon: progress.achievement.icon,
                    message: progress.message,
                    current: progress.current,
                    max: progress.achievement.maxProgress!,
                  };
                }
                return undefined;
              })()}
            />
            
            {/* Enhanced MoodBar Section */}
            <View style={[styles.moodBarContainer, { backgroundColor: theme.cardBg }]}>
              <View style={styles.logsHeader}>
                <Ionicons name="analytics-outline" size={24} color={theme.accent} />
                <Text style={[styles.logsTitle, { color: theme.text }]}>Weekly Progress</Text>
              </View>
              <MoodBar logs={recentLogs} theme={theme} />
              
              {/* Enhanced 30-day grid */}
              <View style={styles.gridContainer}>
                <Text style={[styles.gridTitle, { color: theme.text }]}>Last 30 Days</Text>
                <View style={styles.grid}>
                  {(() => {
                    const days = [];
                    const today = new Date();
                    for (let i = 29; i >= 0; i--) {
                      const d = new Date(today);
                      d.setDate(today.getDate() - i);
                      const dateStr = d.toISOString().slice(0, 10);
                      const logged = recentLogs.some(log => 
                        log.created_at && log.created_at.slice(0, 10) === dateStr
                      );
                      days.push(
                        <View 
                          key={dateStr} 
                          style={[
                            styles.gridDay,
                            { 
                              backgroundColor: logged ? theme.accent : theme.inputBg,
                              borderColor: logged ? theme.accent : theme.inputBorder
                            }
                          ]}
                        >
                          {logged ? (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          ) : (
                            <Ionicons name="close" size={14} color={theme.textSecondary} />
                          )}
                        </View>
                      );
                    }
                    return days;
                  })()}
                </View>
              </View>
            </View>

            {/* Enhanced Summary Card */}
            {analytics && (
              <View style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="stats-chart-outline" size={24} color={theme.accent} />
                  <Text style={[styles.summaryTitle, { color: theme.text }]}>
                    This Week's Summary
                  </Text>
                </View>
                
                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryItem, { backgroundColor: theme.accent + '10' }]}>
                    <Ionicons name="restaurant-outline" size={20} color={theme.accent} />
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{analytics.total_logs}</Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Logs</Text>
                  </View>
                  <View style={[styles.summaryItem, { backgroundColor: theme.accent + '10' }]}>
                    <Ionicons name="flame-outline" size={20} color={theme.accent} />
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{analytics.total_calories}</Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Calories</Text>
                  </View>
                  <View style={[styles.summaryItem, { backgroundColor: theme.accent + '10' }]}>
                    <Ionicons name="heart-outline" size={20} color={theme.accent} />
                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                      {analytics.avg_regret_score?.toFixed(1)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Avg Regret</Text>
                  </View>
                  <View style={[styles.summaryItem, { backgroundColor: theme.accent + '10' }]}>
                    <Ionicons name="trophy-outline" size={20} color={theme.accent} />
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{analytics.best_streak}</Text>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Best Streak</Text>
                  </View>
                </View>

                {/* Enhanced Most Common Food */}
                {recentLogs.length > 0 && (() => {
                  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/s$/, '');
                  const freq: Record<string, { count: number; original: string }> = {};
                  recentLogs.forEach(log => {
                    if (log.food_type) {
                      const key = normalize(log.food_type);
                      freq[key] = (freq[key] || { count: 0, original: log.food_type });
                      freq[key].count = (freq[key].count || 0) + 1;
                      freq[key].original = log.food_type;
                    }
                  });
                  const values = Object.values(freq);
                  let mostCommon: { count: number; original: string } | null = null;
                  for (const val of values) {
                    if (!mostCommon || val.count > mostCommon.count) mostCommon = val;
                  }
                  return mostCommon && mostCommon.count > 1 ? (
                    <View style={styles.mostCommonContainer}>
                      <Text style={[styles.mostCommonLabel, { color: theme.textSecondary }]}>
                        Most Common Food:
                      </Text>
                      <Text style={[styles.mostCommonValue, { color: theme.text }]}>
                        {mostCommon.original} ({mostCommon.count}x)
                      </Text>
                    </View>
                  ) : null;
                })()}
              </View>
            )}
            
            {/* Achievements Section */}
            <View style={[styles.achievementsContainer, { backgroundColor: theme.cardBg }]}>
              <View style={styles.logsHeader}>
                <Ionicons name="trophy-outline" size={24} color={theme.accent} />
                <Text style={[styles.logsTitle, { color: theme.text }]}>Your Achievements</Text>
              </View>
              
              <View style={styles.achievementsGrid}>
                {gamificationService.getUnlockedAchievements().slice(0, 6).map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="small"
                    showProgress={false}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {selectedTab === 'logs' && (
          <>
            {/* Enhanced Recent Logs Section */}
            <View style={[styles.achievementsContainer, { backgroundColor: theme.cardBg }]}>
              <View style={styles.logsHeader}>
                <Ionicons name="time-outline" size={24} color={theme.accent} />
                <Text style={[styles.logsTitle, { color: theme.text }]}>Recent Logs</Text>
              </View>
              
                            {hasLogs ? (
                <View style={styles.logsContainer}>
                  {recentLogs.map((item) => {
                    // Handle both demo data (timestamp) and real data (created_at)
                    const timestamp = item.timestamp || item.created_at;
                    const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);
                    
                    // Check if date is valid
                    const isValidDate = !isNaN(dateObj.getTime());
                    const date = isValidDate ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today';
                    const time = isValidDate ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'Now';
                    
                    return (
                      <View key={item.id} style={[styles.logCard, { backgroundColor: theme.cardBg }]}>
                        <JunkCard 
                          log={{
                            ...item,
                            name: item.food_type || item.name,
                            regretRating: item.regret_rating || item.shameRating,
                            guilt_rating: item.guilt_rating || item.guiltRating,
                            date,
                            time,
                            estimated_calories: item.estimated_calories || 0,
                            ai_motivation: item.ai_motivation || item.notes,
                            photo_url: item.photo_url || item.photo,
                          }} 
                          theme={theme} 
                        />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="restaurant-outline" size={64} color={theme.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No logs yet!</Text>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    Start by logging your first junk food to see your progress here.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: textStyles.h1.fontFamily,
    fontSize: 32, // Much larger text
    fontWeight: '900', // Extra bold
    letterSpacing: 1,
    lineHeight: 36,
    marginBottom: 8,
    color: '#1F2937', // Dark text for better visibility
    textShadowColor: 'rgba(255, 255, 255, 1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontFamily: textStyles.h3.fontFamily,
    fontSize: 18, // Much larger subtitle
    fontWeight: '600', // Semi-bold
    letterSpacing: 0.5,
    lineHeight: 22,
    opacity: 1, // Full opacity
    color: '#4B5563', // Darker, more visible color
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 24,
    padding: 4,
    width: '90%',
    justifyContent: 'center',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabText: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  moodBarContainer: {
    borderRadius: 18,
    marginBottom: 24,
    padding: 20,
    alignSelf: 'center',
    width: '100%',
  },
  gridContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  gridTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
  },
  gridDay: {
    width: 28,
    height: 28,
    borderRadius: 8,
    margin: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 18,
    marginBottom: 24,
    padding: 20,
    alignSelf: 'center',
    width: '100%',
  },
  achievementsContainer: {
    marginBottom: 24,
    borderRadius: 18,
    padding: 20,
    alignSelf: 'center',
    width: '100%',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mostCommonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  mostCommonLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  mostCommonValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 4,
  },
  logsTitle: {
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 0.7,
    marginLeft: 8,
  },
  logsContainer: {
    marginBottom: 16,
  },
  logCard: {
    borderRadius: 18,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  coachContainer: {
    borderRadius: 18,
    marginTop: 8,
  },

});