import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../utils/api';

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
  const [analytics, setAnalytics] = useState<WeeklyAnalytics | null>(null);
  const [recentLogs, setRecentLogs] = useState<JunkFoodLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest('/api/analytics/weekly');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const data = await apiRequest('/api/logs?limit=5');
      setRecentLogs(data);
    } catch (error) {
      console.error('Failed to fetch recent logs:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchRecentLogs()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalytics();
    fetchRecentLogs();
  }, []);

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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Track your journey to better health</Text>
      </LinearGradient>

      {analytics && (
        <>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Ionicons name="restaurant" size={24} color="#e74c3c" />
              <Text style={styles.summaryNumber}>{analytics.total_logs}</Text>
              <Text style={styles.summaryLabel}>This Week</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="trending-down" size={24} color="#f39c12" />
              <Text style={styles.summaryNumber}>{analytics.avg_guilt_score.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Avg Guilt</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="cash" size={24} color="#27ae60" />
              <Text style={styles.summaryNumber}>${analytics.total_cost.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Total Cost</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="flame" size={24} color="#e67e22" />
              <Text style={styles.summaryNumber}>{analytics.total_calories}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Daily Breakdown</Text>
            <View style={styles.chart}>
              {analytics.daily_breakdown.map((day, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max((day.count / 5) * 80, 10),
                          backgroundColor: getProgressColor(day.count, 5),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{formatDate(day.date)}</Text>
                  <Text style={styles.barValue}>{day.count}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.trendsSection}>
            <Text style={styles.sectionTitle}>Trends</Text>
            
            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Ionicons name="heart" size={20} color="#e74c3c" />
                <Text style={styles.trendTitle}>Guilt Level Trend</Text>
              </View>
              <View style={styles.trendBar}>
                <View
                  style={[
                    styles.trendProgress,
                    {
                      width: `${(analytics.avg_guilt_score / 10) * 100}%`,
                      backgroundColor: getProgressColor(analytics.avg_guilt_score, 10),
                    },
                  ]}
                />
              </View>
              <Text style={styles.trendValue}>
                {analytics.avg_guilt_score.toFixed(1)}/10
              </Text>
            </View>

            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Ionicons name="sad" size={20} color="#f39c12" />
                <Text style={styles.trendTitle}>Regret Level Trend</Text>
              </View>
              <View style={styles.trendBar}>
                <View
                  style={[
                    styles.trendProgress,
                    {
                      width: `${(analytics.avg_regret_score / 10) * 100}%`,
                      backgroundColor: getProgressColor(analytics.avg_regret_score, 10),
                    },
                  ]}
                />
              </View>
              <Text style={styles.trendValue}>
                {analytics.avg_regret_score.toFixed(1)}/10
              </Text>
            </View>
          </View>
        </>
      )}

      {recentLogs.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {recentLogs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={styles.logFood}>{log.food_type}</Text>
                <Text style={styles.logDate}>{formatDate(log.created_at)}</Text>
              </View>
              <View style={styles.logStats}>
                <View style={styles.logStat}>
                  <Text style={styles.logStatLabel}>Guilt</Text>
                  <Text style={[styles.logStatValue, { color: '#e74c3c' }]}>
                    {log.guilt_rating}/10
                  </Text>
                </View>
                <View style={styles.logStat}>
                  <Text style={styles.logStatLabel}>Regret</Text>
                  <Text style={[styles.logStatValue, { color: '#f39c12' }]}>
                    {log.regret_rating}/10
                  </Text>
                </View>
                <View style={styles.logStat}>
                  <Text style={styles.logStatLabel}>Cost</Text>
                  <Text style={[styles.logStatValue, { color: '#27ae60' }]}>
                    ${log.estimated_cost.toFixed(0)}
                  </Text>
                </View>
              </View>
              {log.location && (
                <Text style={styles.logLocation}>📍 {log.location}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
});