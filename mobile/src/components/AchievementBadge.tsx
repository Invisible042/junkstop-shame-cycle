import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../styles/theme';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'milestone' | 'social' | 'special' | 'challenge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  xpReward: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export default function AchievementBadge({ 
  achievement, 
  onPress, 
  showProgress = false, 
  size = 'medium',
  animated = true 
}: AchievementBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && achievement.unlocked) {
      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Glow animation for new achievements
      if (achievement.unlockedAt && 
          new Date().getTime() - achievement.unlockedAt.getTime() < 24 * 60 * 60 * 1000) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [achievement.unlocked, animated]);

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return colors.accent;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80, iconSize: 24, fontSize: 10 };
      case 'large':
        return { width: 120, height: 120, iconSize: 36, fontSize: 14 };
      default:
        return { width: 100, height: 100, iconSize: 28, fontSize: 12 };
    }
  };

  const sizeStyles = getSizeStyles();
  const rarityColor = getRarityColor();

  const BadgeContent = () => (
    <View style={[
      styles.badge,
      {
        width: sizeStyles.width,
        height: sizeStyles.height,
        borderColor: achievement.unlocked ? rarityColor : '#374151',
        backgroundColor: achievement.unlocked ? 'rgba(35, 38, 58, 0.9)' : 'rgba(35, 38, 58, 0.5)',
      }
    ]}>
      <Ionicons 
        name={achievement.icon as any} 
        size={sizeStyles.iconSize} 
        color={achievement.unlocked ? rarityColor : '#6B7280'} 
      />
      {achievement.unlocked && (
        <View style={[styles.xpBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.xpText}>+{achievement.xpReward}XP</Text>
        </View>
      )}
      {showProgress && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#374151' }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                  backgroundColor: rarityColor 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.maxProgress}
          </Text>
        </View>
      )}
    </View>
  );

  const BadgeWrapper = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: scaleAnim }],
        shadowColor: rarityColor,
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    ]}>
      <BadgeWrapper onPress={onPress} style={styles.touchable}>
        <BadgeContent />
        <Text style={[styles.title, { fontSize: sizeStyles.fontSize }]} numberOfLines={2}>
          {achievement.title}
        </Text>
      </BadgeWrapper>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: spacing.sm,
  },
  touchable: {
    alignItems: 'center',
  },
  badge: {
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  xpBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  xpText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 100,
  },
  progressContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 8,
    marginTop: 2,
  },
}); 