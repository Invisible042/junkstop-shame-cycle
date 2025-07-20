import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from './AchievementBadge';
import { colors, spacing, fontSizes } from '../styles/theme';

interface AchievementNotificationProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export default function AchievementNotification({ 
  achievement, 
  visible, 
  onClose 
}: AchievementNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common': return ['#6B7280', '#4B5563'];
      case 'rare': return ['#3B82F6', '#1D4ED8'];
      case 'epic': return ['#8B5CF6', '#7C3AED'];
      case 'legendary': return ['#F59E0B', '#D97706'];
      default: return [colors.accent, colors.accent];
    }
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
        }
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          }
        ]}
      >
        <LinearGradient
          colors={getRarityColor()}
          style={styles.notification}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={achievement.icon as any} 
              size={32} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Achievement Unlocked!</Text>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
            <View style={styles.xpContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={hideNotification}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxWidth: 350,
  },
  notification: {
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.small,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    fontSize: fontSizes.lg,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSizes.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: fontSizes.body,
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
}); 