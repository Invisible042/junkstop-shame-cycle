import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  onPress?: () => void;
  animated?: boolean;
}

export default function AchievementCard({
  title,
  description,
  icon,
  xpReward,
  unlocked,
  unlockedAt,
  onPress,
  animated = true,
}: AchievementCardProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation for unlocked achievements
      if (unlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();

        // Sparkle animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [animated, unlocked, scaleAnim, opacityAnim, glowAnim, sparkleAnim]);

  const getGradientColors = () => {
    if (unlocked) {
      return ['#FFD700', '#FFA500', '#FF8C00'];
    }
    return ['#6B7280', '#4B5563', '#374151'];
  };

  const getIconColor = () => {
    return unlocked ? '#FFD700' : '#9CA3AF';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors() as [string, string, string]}
          style={[
            styles.gradient,
            {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Sparkle effect for unlocked achievements */}
          {unlocked && (
            <Animated.View
              style={[
                styles.sparkle,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="sparkles" size={16} color="#FFD700" />
            </Animated.View>
          )}

          {/* Achievement Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={32} color={getIconColor()} />
            {unlocked && (
              <View style={styles.unlockBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>

          {/* Achievement Info */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {description}
            </Text>
            
            {/* XP Reward */}
            <View style={styles.xpContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.xpText}>+{xpReward} XP</Text>
            </View>

            {/* Unlock Date */}
            {unlocked && unlockedAt && (
              <Text style={styles.unlockDate}>
                Unlocked {formatDate(unlockedAt)}
              </Text>
            )}
          </View>

          {/* Status Indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: unlocked ? '#4CAF50' : '#9CA3AF' }]}>
            <Ionicons
              name={unlocked ? 'trophy' : 'lock-closed'}
              size={16}
              color="#fff"
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  unlockBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  unlockDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
}); 