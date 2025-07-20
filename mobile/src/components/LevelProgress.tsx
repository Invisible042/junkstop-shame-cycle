import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../styles/theme';

interface LevelProgressProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  animated?: boolean;
  nextAchievement?: {
    title: string;
    icon: string;
    message: string;
    current: number;
    max: number;
  };
}

export default function LevelProgress({ 
  level, 
  currentXP, 
  xpToNextLevel, 
  animated = true,
  nextAchievement
}: LevelProgressProps) {
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (animated) {
      const progress = Math.min(currentXP / xpToNextLevel, 1);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [currentXP, xpToNextLevel, animated]);

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Novice';
    if (level < 10) return 'Apprentice';
    if (level < 15) return 'Adept';
    if (level < 20) return 'Expert';
    if (level < 25) return 'Master';
    if (level < 30) return 'Grandmaster';
    return 'Legend';
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return ['#6B7280', '#4B5563'];
    if (level < 10) return ['#3B82F6', '#1D4ED8'];
    if (level < 15) return ['#10B981', '#059669'];
    if (level < 20) return ['#8B5CF6', '#7C3AED'];
    if (level < 25) return ['#F59E0B', '#D97706'];
    if (level < 30) return ['#EF4444', '#DC2626'];
    return ['#EC4899', '#DB2777'];
  };

  const levelColors = getLevelColor(level);
  const levelTitle = getLevelTitle(level);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={levelColors as [string, string]}
        style={styles.levelCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelNumber}>Level {level}</Text>
            <Text style={styles.levelTitle}>{levelTitle}</Text>
          </View>
          <View style={styles.xpInfo}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.xpText}>{currentXP} / {xpToNextLevel} XP</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((currentXP / xpToNextLevel) * 100)}% to next level
          </Text>
        </View>

        {/* Next Achievement Section */}
        {nextAchievement && (
          <View style={styles.nextAchievementSection}>
            <View style={styles.nextAchievementHeader}>
              <Ionicons name="trophy-outline" size={16} color="#FFD700" />
              <Text style={styles.nextAchievementTitle}>Next Achievement</Text>
            </View>
            
            <View style={styles.achievementCard}>
              <View style={styles.achievementInfo}>
                <Ionicons 
                  name={nextAchievement.icon as any} 
                  size={20} 
                  color="#FFD700" 
                />
                <View style={styles.achievementText}>
                  <Text style={styles.achievementName}>{nextAchievement.title}</Text>
                  <Text style={styles.achievementMessage}>{nextAchievement.message}</Text>
                </View>
              </View>
              
              <View style={styles.achievementProgress}>
                <View style={styles.achievementProgressBar}>
                  <View 
                    style={[
                      styles.achievementProgressFill,
                      { width: `${Math.min((nextAchievement.current / nextAchievement.max) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.achievementProgressText}>
                  {nextAchievement.current}/{nextAchievement.max}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.rewards}>
          <Text style={styles.rewardsTitle}>Level {level + 1} Rewards:</Text>
          <View style={styles.rewardItems}>
            <View style={styles.rewardItem}>
              <Ionicons name="trophy" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>New Achievement Unlocked</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>+{Math.floor(xpToNextLevel * 0.1)} Bonus XP</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  levelCard: {
    borderRadius: 18,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: fontSizes.heading,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  levelTitle: {
    fontSize: fontSizes.body,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: fontSizes.body,
    color: '#fff',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSizes.small,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  nextAchievementSection: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextAchievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nextAchievementTitle: {
    fontSize: fontSizes.small,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.sm,
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  achievementName: {
    fontSize: fontSizes.body,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementMessage: {
    fontSize: fontSizes.small,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: fontSizes.small,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  rewards: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: spacing.md,
  },
  rewardsTitle: {
    fontSize: fontSizes.body,
    color: '#fff',
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  rewardItems: {
    gap: spacing.xs,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: fontSizes.small,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: spacing.xs,
  },
}); 