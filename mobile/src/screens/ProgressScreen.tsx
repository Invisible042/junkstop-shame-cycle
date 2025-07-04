import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';
import StreakBadge from '../components/StreakBadge';

const { width } = Dimensions.get('window');

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

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['weeklyAnalytics'],
    queryFn: () => apiRequest('/api/analytics/weekly'),
  });

  const {
    data: recentLogs,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => apiRequest('/api/logs?limit=5'),
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['weeklyAnalytics'] }),
      queryClient.invalidateQueries({ queryKey: ['recentLogs'] }),
    ]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage < 30) return '#4caf50';
    if (percentage < 70) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {(analyticsLoading || logsLoading) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <ActivityIndicator size="large" color={colors.accent || '#e74c3c'} />
            </View>
      )}
      {!(analyticsLoading || logsLoading) && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          {(!analytics || !recentLogs) ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body, textAlign: 'center' }}>
                No progress data available yet. Log some junk food to see your stats!
              </Text>
            </View>
          ) : (
            <>
              {/* Streak Badge Section */}
              <StreakBadge streak={analytics.streak_count || 0} />

              {/* Streak Progress Journey */}
              <View style={[cardStyle, { marginBottom: spacing.lg, backgroundColor: '#23263acc', minHeight: 320 }]}>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.heading, textAlign: 'center', marginBottom: spacing.xs }}>
                  Your Journey
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small, textAlign: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.lg }}>
                  Visualize your streak progress as your inner world changes
                </Text>
                
                {/* Progress Indicator */}
                <View style={styles.progressIndicator}>
                  {[1, 2, 3, 4, 5].map((dot, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.progressDot,
                        index === 0 ? styles.progressDotActive : styles.progressDotInactive
                      ]} 
                    />
                  ))}
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.streakScrollContainer}
                >
                  {/* Left Arrow Hint */}
                  <View style={styles.leftArrowHint}>
                    <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.3)" />
                  </View>

                  {[
                    { image: require('../../assets/streak1 (2).png'), label: 'Day 0', title: 'Rock Bottom', unlocked: true },
                    { image: require('../../assets/streak2 (2).png'), label: 'Day 3', title: 'Getting Started', unlocked: analytics.streak_count >= 3 },
                    { image: require('../../assets/streak3 (2).png'), label: 'Day 5', title: 'Building Habits', unlocked: analytics.streak_count >= 5 },
                    { image: require('../../assets/streak4 (2).png'), label: 'Day 7+', title: 'On Track', unlocked: analytics.streak_count >= 7 },
                    { image: require('../../assets/streak5.png'), label: 'Day 30+', title: 'Thriving', unlocked: analytics.streak_count >= 30 },
                  ].map((stage, index) => (
                    <View key={index} style={styles.streakStage}>
                      <View style={[
                        styles.streakCard,
                        !stage.unlocked && styles.streakCardLocked
                      ]}>
                        <Image 
                          source={stage.image} 
                          style={[
                            styles.streakImage,
                            !stage.unlocked && styles.streakImageBlurred
                          ]} 
                        />
                        {!stage.unlocked && (
                          <View style={styles.lockOverlay}>
                            <Ionicons name="lock-closed" size={28} color="#fff" />
                            <Text style={styles.lockMessage}>
                              {index === 1 ? "Reach Day 3 to unlock!" :
                               index === 2 ? "Reach Day 5 to unlock!" :
                               index === 3 ? "Reach Day 7 to unlock!" :
                               "Reach Day 30 to unlock!"}
                            </Text>
                          </View>
                        )}
                        <View style={styles.streakCardContent}>
                          <Text style={[
                            styles.streakLabel,
                            stage.unlocked ? styles.streakLabelUnlocked : styles.streakLabelLocked
                          ]}>
                            {stage.label}
                          </Text>
                          <Text style={[
                            styles.streakTitle,
                            stage.unlocked ? styles.streakTitleUnlocked : styles.streakTitleLocked
                          ]}>
                            {stage.title}
                          </Text>
                          <Text style={[
                            styles.streakMotivation,
                            stage.unlocked ? styles.streakMotivationUnlocked : styles.streakMotivationLocked
                          ]}>
                            {stage.unlocked ? 
                              (index === 0 ? "You've taken the first step!" :
                               index === 1 ? "Great progress, keep going!" :
                               index === 2 ? "You're building amazing habits!" :
                               index === 3 ? "You're on fire! 🔥" :
                               "You're absolutely thriving! 🌟") :
                              (index === 1 ? "Just 3 more days to unlock!" :
                               index === 2 ? "5 days away from this milestone!" :
                               index === 3 ? "7 days to reach this goal!" :
                               "30 days to become unstoppable!")
                            }
                          </Text>
                        </View>
                      </View>
                      {index < 4 && (
                        <View style={styles.arrowContainer}>
                          <Ionicons 
                            name="chevron-forward" 
                            size={24} 
                            color={stage.unlocked ? colors.accent : '#666'} 
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Summary Cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center' }]}> 
                  <Ionicons name="flame" size={24} color="#ffd700" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 24 }}>{analytics.best_streak || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Best Streak</Text>
              </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center' }]}> 
                  <Ionicons name="cash" size={24} color="#27ae60" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 24 }}>${analytics.total_cost?.toFixed(0) || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Money Saved</Text>
            </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center' }]}> 
                  <Ionicons name="journal" size={24} color="#2196f3" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#2196f3', fontWeight: 'bold', fontSize: 24 }}>{analytics.total_logs || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Total Logs</Text>
          </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center' }]}> 
                  <Ionicons name="bar-chart" size={24} color="#ff9800" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#ff9800', fontWeight: 'bold', fontSize: 24 }}>{analytics.avg_guilt_score?.toFixed(1) || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Avg Guilt</Text>
                </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center' }]}> 
                  <Ionicons name="heart" size={24} color="#9b59b6" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: 24 }}>{analytics.avg_regret_score?.toFixed(1) || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Avg Regret</Text>
                </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center' }]}> 
                  <Ionicons name="nutrition" size={24} color="#00b894" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#00b894', fontWeight: 'bold', fontSize: 24 }}>{analytics.total_calories || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Total Calories</Text>
                </View>
              </View>

              {/* Simple Bar Chart for Daily Breakdown */}
              <LinearGradient
                colors={["#23263a", "#3a3ad6", "#7b2ff2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 28,
                  marginBottom: spacing.lg,
                  minHeight: 200,
                  padding: spacing.lg,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.22,
                  shadowRadius: 16,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <View style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(30,32,60,0.55)',
                  borderRadius: 28,
                  zIndex: 0,
                }} />
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 22,
                  marginBottom: 2,
                  textAlign: 'center',
                  letterSpacing: 0.5,
                  textShadowColor: '#000',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                  zIndex: 1,
                }}>
                  This Week
                </Text>
                <Text style={{
                  color: '#00c6fb',
                  fontSize: 13,
                  textAlign: 'center',
                  marginBottom: 10,
                  fontStyle: 'italic',
                  opacity: 0.85,
                  zIndex: 1,
                }}>
                  Keep up the momentum!
                </Text>
                {/* Summary Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10, zIndex: 1 }}>
                  <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#fff', fontSize: 13, marginRight: 12 }}>Total logs: {analytics.total_logs || 0}</Text>
                  <Ionicons name="star" size={15} color="#ffd700" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#ffd700', fontSize: 13 }}>
                    Best day: {analytics.daily_breakdown && analytics.daily_breakdown.length > 0 ? Math.max(...analytics.daily_breakdown.map(d => d.count)) : 0} logs
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, minHeight: 100, maxHeight: 100, paddingHorizontal: 2, zIndex: 1 }}>
                  {analytics.daily_breakdown?.map((day, idx) => {
                    const max = Math.max(...analytics.daily_breakdown.map(d => d.count));
                    const barHeight = max ? Math.min((day.count / max) * 80, 80) : 0;
                    const barColor = '#00c6fb';
                    // Get weekday abbreviation
                    const dateObj = new Date(day.date);
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <View style={{
                          height: barHeight,
                          width: 18,
                          backgroundColor: barColor,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          marginBottom: 4,
                          shadowColor: barColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.45,
                          shadowRadius: 8,
                          elevation: 5,
                        }} />
                        <Text style={{ fontSize: 12, color: barColor, fontWeight: 'bold', marginTop: 2 }}>{weekday}</Text>
                      </View>
                    );
                  })}
                </View>
              </LinearGradient>

              {/* Recent Logs */}
              <View style={{
                backgroundColor: 'rgba(36, 40, 60, 0.7)',
                borderRadius: 28,
                marginBottom: spacing.lg,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.14,
                shadowRadius: 14,
                elevation: 7,
                overflow: 'hidden',
              }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 12, textAlign: 'center', letterSpacing: 0.5, textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>Recent Logs</Text>
                {recentLogs.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: spacing.lg }}>
                    <Ionicons name="cloud-outline" size={48} color="#00c6fb" style={{ marginBottom: 8 }} />
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>No logs yet.</Text>
                    <Text style={{ color: '#b2f7ef', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>Start logging to see your journey take shape!</Text>
                  </View>
                ) : (
                  recentLogs.map((log, idx) => (
                    <View key={log.id || idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                      {log.photo_url ? (
                        <View style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: '#00c6fb',
                          backgroundColor: '#222',
                          marginRight: 16,
                          overflow: 'hidden',
                        }}>
                          <Image source={{ uri: log.photo_url }} style={{ width: '100%', height: '100%', borderRadius: 13 }} />
                        </View>
                      ) : (
                        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#23263a', marginRight: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#444' }}>
                          <Ionicons name="fast-food-outline" size={28} color="#666" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, marginBottom: 2 }}>{log.food_type}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{
                            backgroundColor: 'rgba(255,255,255,0.13)',
                            color: '#00c6fb',
                            fontSize: 12,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            marginRight: 8,
                          }}>{formatDate(log.created_at)}</Text>
                          {log.location && (
                            <Text style={{ color: '#b2f7ef', fontStyle: 'italic', fontSize: 12 }}>@ {log.location}</Text>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                          <Text style={{
                            backgroundColor: 'rgba(255,255,255,0.13)',
                            color: '#00c6fb',
                            fontSize: 12,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginRight: 6,
                            fontWeight: 'bold',
                          }}>Guilt: {log.guilt_rating}</Text>
                          <Text style={{
                            backgroundColor: 'rgba(255,255,255,0.13)',
                            color: '#00c6fb',
                            fontSize: 12,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginRight: 6,
                            fontWeight: 'bold',
                          }}>Regret: {log.regret_rating}</Text>
                          <Text style={{
                            backgroundColor: 'rgba(255,255,255,0.13)',
                            color: '#00c6fb',
                            fontSize: 12,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            fontWeight: 'bold',
                          }}>Cost: ${log.estimated_cost}</Text>
                        </View>
                        {log.ai_motivation && (
                          <Text style={{ color: '#b2b7c3', fontStyle: 'italic', fontSize: 12, marginTop: 2 }}>
                            “{log.ai_motivation}”
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 30,
  },
  summaryCard: {
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
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  trendsSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendCard: {
    marginBottom: 20,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  trendBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trendProgress: {
    height: '100%',
    borderRadius: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    textAlign: 'right',
  },
  recentSection: {
    margin: 20,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logFood: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  logDate: {
    fontSize: 12,
    color: '#666',
  },
  logStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  logStat: {
    alignItems: 'center',
  },
  logStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  logStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  logLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  streakScrollContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  streakStage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  streakCard: {
    width: 200,
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakCardLocked: {
    opacity: 0.3,
  },
  streakImage: {
    width: '100%',
    height: 185,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  streakImageBlurred: {
    opacity: 0.05,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  streakCardContent: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 75,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: 'rgba(51, 51, 51, 0.8)',
  },
  streakLabelLocked: {
    color: 'rgba(153, 153, 153, 0.6)',
  },
  streakLabelUnlocked: {
    color: 'rgba(51, 51, 51, 0.8)',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgba(51, 51, 51, 0.9)',
  },
  streakTitleLocked: {
    color: 'rgba(153, 153, 153, 0.7)',
  },
  streakTitleUnlocked: {
    color: 'rgba(51, 51, 51, 0.9)',
  },
  arrowContainer: {
    marginHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakMotivation: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  streakMotivationUnlocked: {
    color: '#166534',
    fontWeight: '600',
  },
  streakMotivationLocked: {
    color: '#999',
    fontStyle: 'italic',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
  },
  progressDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  leftArrowHint: {
    position: 'absolute',
    left: spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  lockMessage: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
});