import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

export default function ProgressScreen() {
  const { logs, currentStreak, bestStreak } = useData();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dailyStats = last7Days.map(date => {
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return (
          logDate.getDate() === date.getDate() &&
          logDate.getMonth() === date.getMonth() &&
          logDate.getFullYear() === date.getFullYear()
        );
      });

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayLogs.length,
        avgGuilt: dayLogs.length > 0 
          ? dayLogs.reduce((sum, log) => sum + log.guiltRating, 0) / dayLogs.length 
          : 0,
        calories: dayLogs.reduce((sum, log) => sum + log.estimatedCalories, 0),
      };
    });

    return dailyStats;
  }, [logs]);

  const weeklyTrends = useMemo(() => {
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });

      return {
        week: `Week ${4 - i}`,
        count: weekLogs.length,
        avgGuilt: weekLogs.length > 0 
          ? weekLogs.reduce((sum, log) => sum + log.guiltRating, 0) / weekLogs.length 
          : 0,
        totalCalories: weekLogs.reduce((sum, log) => sum + log.estimatedCalories, 0),
      };
    });

    return weeks.reverse();
  }, [logs]);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(255, 255, 255, 0.1)',
    backgroundGradientTo: 'rgba(255, 255, 255, 0.1)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
    propsForVerticalLabels: {
      fontSize: 10,
    },
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#3B82F6', '#1E40AF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your journey to better habits</Text>

          {/* Current Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={32} color="#F59E0B" />
              <Text style={styles.statNumber}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={32} color="#10B981" />
              <Text style={styles.statNumber}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="restaurant" size={32} color="#EF4444" />
              <Text style={styles.statNumber}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total Logs</Text>
            </View>
          </View>

          {/* Daily Junk Food Count Chart */}
          {chartData.some(d => d.count > 0) && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Daily Junk Food Count (Last 7 Days)</Text>
              <BarChart
                data={{
                  labels: chartData.map(d => d.date),
                  datasets: [{
                    data: chartData.map(d => d.count),
                  }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                verticalLabelRotation={30}
                showValuesOnTopOfBars
              />
            </View>
          )}

          {/* Guilt Level Trend */}
          {chartData.some(d => d.avgGuilt > 0) && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Average Guilt Level Trend</Text>
              <LineChart
                data={{
                  labels: chartData.map(d => d.date),
                  datasets: [{
                    data: chartData.map(d => d.avgGuilt || 0),
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                    strokeWidth: 3,
                  }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
                verticalLabelRotation={30}
              />
            </View>
          )}

          {/* Weekly Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Weekly Summary</Text>
            {weeklyTrends.map((week, index) => (
              <View key={index} style={styles.weekCard}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekTitle}>{week.week}</Text>
                  <Text style={styles.weekCount}>{week.count} logs</Text>
                </View>
                <View style={styles.weekStats}>
                  <View style={styles.weekStat}>
                    <Ionicons name="sad-outline" size={16} color="#EF4444" />
                    <Text style={styles.weekStatText}>
                      Avg Guilt: {week.avgGuilt.toFixed(1)}/10
                    </Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Ionicons name="restaurant-outline" size={16} color="#F97316" />
                    <Text style={styles.weekStatText}>
                      {week.totalCalories} calories
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightCard}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Pattern Recognition</Text>
                <Text style={styles.insightText}>
                  {logs.length === 0 
                    ? "Start logging to see patterns in your eating habits."
                    : logs.length < 7
                    ? "Keep logging for a week to identify patterns."
                    : `You've logged ${logs.length} items. ${
                        currentStreak > 3 
                          ? "Great streak! Keep it up!" 
                          : "Focus on building longer clean streaks."
                      }`
                  }
                </Text>
              </View>
            </View>

            {logs.length > 0 && (
              <View style={styles.insightCard}>
                <Ionicons name="trending-up" size={24} color="#10B981" />
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Progress Tip</Text>
                  <Text style={styles.insightText}>
                    {currentStreak === 0 
                      ? "Every expert was once a beginner. Start your streak today!"
                      : currentStreak < 7
                      ? "You're building momentum! The first week is the hardest."
                      : "Amazing work! You're developing healthy habits that last."
                    }
                  </Text>
                </View>
              </View>
            )}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  summaryContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  weekCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  weekCount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekStatText: {
    fontSize: 12,
    color: '#E2E8F0',
    marginLeft: 4,
  },
  insightsContainer: {
    marginBottom: 30,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
  },
});