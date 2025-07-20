import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AchievementBadge, { Achievement } from '../components/AchievementBadge';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getTotalXP, getCompletionPercentage } from '../data/achievements';
import { colors, spacing, fontSizes } from '../styles/theme';
import { useTheme } from '../contexts/ThemeContext';

type CategoryType = 'all' | 'streak' | 'milestone' | 'social' | 'special' | 'challenge';

export default function AchievementsScreen() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(ACHIEVEMENTS);

  // Mock data - in real app, this would come from backend
  useEffect(() => {
    // Simulate some unlocked achievements
    const mockUnlocked = userAchievements.map(achievement => {
      if (achievement.id === 'first_log') {
        return { ...achievement, unlocked: true, unlockedAt: new Date() };
      }
      if (achievement.id === 'first_day') {
        return { ...achievement, unlocked: true, unlockedAt: new Date(), progress: 1, maxProgress: 1 };
      }
      if (achievement.id === 'ten_logs') {
        return { ...achievement, progress: 5, maxProgress: 10 };
      }
      return achievement;
    });
    setUserAchievements(mockUnlocked);
  }, []);

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return userAchievements;
    }
    return userAchievements.filter(a => a.type === selectedCategory);
  };

  const getCategoryStats = () => {
    const filtered = getFilteredAchievements();
    const unlocked = filtered.filter(a => a.unlocked).length;
    const total = filtered.length;
    return { unlocked, total, percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0 };
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'streak': return 'trending-up';
      case 'milestone': return 'flag';
      case 'social': return 'people';
      case 'special': return 'star';
      case 'challenge': return 'trophy';
      default: return 'grid';
    }
  };

  const getCategoryColor = (category: CategoryType) => {
    switch (category) {
      case 'streak': return '#3B82F6';
      case 'milestone': return '#10B981';
      case 'social': return '#8B5CF6';
      case 'special': return '#F59E0B';
      case 'challenge': return '#EF4444';
      default: return theme.accent;
    }
  };

  const totalXP = getTotalXP();
  const completionPercentage = getCompletionPercentage();
  const categoryStats = getCategoryStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.backgroundGradient}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Achievements</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Track your progress and unlock rewards
        </Text>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={[styles.statsContainer, { backgroundColor: theme.cardBg }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{totalXP}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{completionPercentage}%</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Complete</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{categoryStats.unlocked}/{categoryStats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Unlocked</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {(['all', 'streak', 'milestone', 'social', 'special', 'challenge'] as CategoryType[]).map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category ? getCategoryColor(category) : theme.cardBg,
                borderColor: getCategoryColor(category),
              }
            ]}
          >
            <Ionicons
              name={getCategoryIcon(category) as any}
              size={16}
              color={selectedCategory === category ? '#fff' : getCategoryColor(category)}
            />
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? '#fff' : theme.text }
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements Grid */}
      <ScrollView 
        style={styles.achievementsScroll}
        contentContainerStyle={styles.achievementsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.achievementsGrid}>
          {getFilteredAchievements().map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              onPress={() => handleAchievementPress(achievement)}
              showProgress={achievement.progress !== undefined}
              size="medium"
            />
          ))}
        </View>
      </ScrollView>

      {/* Achievement Detail Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            {selectedAchievement && (
              <>
                <View style={styles.modalHeader}>
                  <AchievementBadge
                    achievement={selectedAchievement}
                    size="large"
                    animated={false}
                  />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedAchievement.title}
                  </Text>
                  <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                    {selectedAchievement.description}
                  </Text>
                </View>

                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Ionicons name="star" size={16} color={theme.accent} />
                    <Text style={[styles.modalStatText, { color: theme.text }]}>
                      {selectedAchievement.xpReward} XP
                    </Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Ionicons 
                      name={selectedAchievement.unlocked ? "checkmark-circle" : "lock-closed"} 
                      size={16} 
                      color={selectedAchievement.unlocked ? "#10B981" : "#6B7280"} 
                    />
                    <Text style={[styles.modalStatText, { color: theme.text }]}>
                      {selectedAchievement.unlocked ? 'Unlocked' : 'Locked'}
                    </Text>
                  </View>
                  {selectedAchievement.progress !== undefined && (
                    <View style={styles.modalStat}>
                      <Ionicons name="analytics" size={16} color={theme.accent} />
                      <Text style={[styles.modalStatText, { color: theme.text }]}>
                        {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedAchievement.unlockedAt && (
                  <View style={styles.unlockInfo}>
                    <Text style={[styles.unlockLabel, { color: theme.textSecondary }]}>
                      Unlocked on:
                    </Text>
                    <Text style={[styles.unlockDate, { color: theme.text }]}>
                      {selectedAchievement.unlockedAt.toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.accent }]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSizes.body,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.small,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#374151',
    marginHorizontal: spacing.sm,
  },
  categoryScroll: {
    marginBottom: spacing.lg,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  achievementsScroll: {
    flex: 1,
  },
  achievementsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    maxWidth: 350,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: fontSizes.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatText: {
    fontSize: fontSizes.small,
    marginTop: spacing.xs,
  },
  unlockInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  unlockLabel: {
    fontSize: fontSizes.small,
    marginBottom: spacing.xs,
  },
  unlockDate: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
}); 