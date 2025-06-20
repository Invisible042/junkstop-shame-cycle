import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

interface Confession {
  id: string;
  text: string;
  timestamp: number;
  likes: number;
  replies: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'confessions' | 'achievements' | 'leaderboard'>('confessions');
  const [showConfessionModal, setShowConfessionModal] = useState(false);
  const [confessionText, setConfessionText] = useState('');

  // Mock data - in production this would come from Firebase/backend
  const [confessions, setConfessions] = useState<Confession[]>([
    {
      id: '1',
      text: "I ate an entire bag of chips while watching Netflix last night. The guilt is real, but I'm starting fresh today. 💪",
      timestamp: Date.now() - 3600000,
      likes: 12,
      replies: 3,
    },
    {
      id: '2',
      text: "Day 5 without junk food! The cravings are getting easier to manage. This app is really helping me stay accountable.",
      timestamp: Date.now() - 7200000,
      likes: 24,
      replies: 7,
    },
    {
      id: '3',
      text: "Failed after 2 weeks clean. Stress eating got the best of me. But I'm not giving up - back on track tomorrow!",
      timestamp: Date.now() - 86400000,
      likes: 18,
      replies: 5,
    },
  ]);

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Step',
      description: 'Log your first junk food item',
      icon: 'footsteps-outline',
      unlocked: true,
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Maintain a 7-day clean streak',
      icon: 'calendar-outline',
      unlocked: false,
      progress: 3,
      total: 7,
    },
    {
      id: '3',
      title: 'Honest Helper',
      description: 'Share your first confession',
      icon: 'heart-outline',
      unlocked: false,
    },
    {
      id: '4',
      title: 'Month Master',
      description: 'Achieve a 30-day clean streak',
      icon: 'trophy-outline',
      unlocked: false,
      progress: 3,
      total: 30,
    },
    {
      id: '5',
      title: 'Supportive Soul',
      description: 'Give 10 likes to community posts',
      icon: 'thumbs-up-outline',
      unlocked: false,
      progress: 2,
      total: 10,
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'HealthyHero', streak: 45, points: 4500 },
    { rank: 2, name: 'CleanEater23', streak: 32, points: 3200 },
    { rank: 3, name: 'NoJunkJoe', streak: 28, points: 2800 },
    { rank: 4, name: 'FreshStart', streak: 21, points: 2100 },
    { rank: 5, name: 'WillpowerWin', streak: 18, points: 1800 },
  ];

  const submitConfession = () => {
    if (!confessionText.trim()) {
      Alert.alert('Empty confession', 'Please write something to share with the community.');
      return;
    }

    const newConfession: Confession = {
      id: Date.now().toString(),
      text: confessionText.trim(),
      timestamp: Date.now(),
      likes: 0,
      replies: 0,
    };

    setConfessions(prev => [newConfession, ...prev]);
    setConfessionText('');
    setShowConfessionModal(false);
    
    Alert.alert('Posted!', 'Your confession has been shared anonymously with the community.');
  };

  const likeConfession = (id: string) => {
    setConfessions(prev =>
      prev.map(confession =>
        confession.id === id
          ? { ...confession, likes: confession.likes + 1 }
          : confession
      )
    );
  };

  const renderConfessions = () => (
    <View style={styles.tabContent}>
      <View style={styles.confessionHeader}>
        <Text style={styles.sectionTitle}>Anonymous Confessions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowConfessionModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionSubtitle}>
        Share your struggles and victories anonymously
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {confessions.map((confession) => (
          <View key={confession.id} style={styles.confessionCard}>
            <Text style={styles.confessionText}>{confession.text}</Text>
            <View style={styles.confessionFooter}>
              <Text style={styles.confessionTime}>
                {new Date(confession.timestamp).toLocaleDateString()}
              </Text>
              <View style={styles.confessionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => likeConfession(confession.id)}
                >
                  <Ionicons name="heart-outline" size={16} color="#EF4444" />
                  <Text style={styles.actionText}>{confession.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={16} color="#8B5CF6" />
                  <Text style={styles.actionText}>{confession.replies}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Achievements</Text>
      <Text style={styles.sectionSubtitle}>Track your progress milestones</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {achievements.map((achievement) => (
          <Animatable.View
            key={achievement.id}
            animation={achievement.unlocked ? "pulse" : undefined}
            style={[
              styles.achievementCard,
              achievement.unlocked && styles.achievementUnlocked,
            ]}
          >
            <View style={styles.achievementIcon}>
              <Ionicons
                name={achievement.icon as any}
                size={32}
                color={achievement.unlocked ? '#10B981' : '#6B7280'}
              />
            </View>
            <View style={styles.achievementContent}>
              <Text
                style={[
                  styles.achievementTitle,
                  achievement.unlocked && styles.achievementTitleUnlocked,
                ]}
              >
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              {achievement.progress !== undefined && achievement.total && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(achievement.progress / achievement.total) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              )}
            </View>
            {achievement.unlocked && (
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            )}
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Global Leaderboard</Text>
      <Text style={styles.sectionSubtitle}>Top streaks this month</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {leaderboard.map((user) => (
          <View
            key={user.rank}
            style={[
              styles.leaderboardCard,
              user.rank <= 3 && styles.topThreeCard,
            ]}
          >
            <View style={styles.rankContainer}>
              <Text
                style={[
                  styles.rankText,
                  user.rank <= 3 && styles.topThreeRank,
                ]}
              >
                #{user.rank}
              </Text>
              {user.rank === 1 && (
                <Ionicons name="trophy" size={20} color="#F59E0B" />
              )}
              {user.rank === 2 && (
                <Ionicons name="medal" size={20} color="#E5E7EB" />
              )}
              {user.rank === 3 && (
                <Ionicons name="medal" size={20} color="#CD7C2F" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userStreak}>{user.streak} day streak</Text>
            </View>
            <Text style={styles.userPoints}>{user.points} pts</Text>
          </View>
        ))}

        <View style={styles.yourRankCard}>
          <Text style={styles.yourRankTitle}>Your Position</Text>
          <Text style={styles.yourRankText}>Rank #247 - Keep going!</Text>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <LinearGradient
      colors={['#7C3AED', '#3B82F6', '#1E40AF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect with others on the same journey</Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'confessions' && styles.activeTab]}
            onPress={() => setActiveTab('confessions')}
          >
            <Ionicons
              name="chatbubbles"
              size={20}
              color={activeTab === 'confessions' ? '#8B5CF6' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'confessions' && styles.activeTabText,
              ]}
            >
              Confessions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
            onPress={() => setActiveTab('achievements')}
          >
            <Ionicons
              name="trophy"
              size={20}
              color={activeTab === 'achievements' ? '#8B5CF6' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'achievements' && styles.activeTabText,
              ]}
            >
              Achievements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Ionicons
              name="podium"
              size={20}
              color={activeTab === 'leaderboard' ? '#8B5CF6' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'leaderboard' && styles.activeTabText,
              ]}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'confessions' && renderConfessions()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
        </View>
      </SafeAreaView>

      {/* Confession Modal */}
      <Modal
        visible={showConfessionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Anonymous Confession</Text>
              <TouchableOpacity onPress={() => setShowConfessionModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Share your experience anonymously to help others
            </Text>
            
            <TextInput
              style={styles.confessionInput}
              multiline
              placeholder="What's on your mind? Share your struggles, victories, or advice..."
              placeholderTextColor="#9CA3AF"
              value={confessionText}
              onChangeText={setConfessionText}
              maxLength={500}
            />
            
            <Text style={styles.characterCount}>
              {confessionText.length}/500 characters
            </Text>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                !confessionText.trim() && styles.submitButtonDisabled,
              ]}
              onPress={submitConfession}
              disabled={!confessionText.trim()}
            >
              <Text style={styles.submitButtonText}>Share Anonymously</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 20,
  },
  confessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confessionText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  confessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confessionTime: {
    color: '#94A3B8',
    fontSize: 12,
  },
  confessionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    color: '#E2E8F0',
    fontSize: 12,
    marginLeft: 4,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  achievementIcon: {
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementTitleUnlocked: {
    color: 'white',
  },
  achievementDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  progressText: {
    color: '#E2E8F0',
    fontSize: 12,
    minWidth: 40,
  },
  leaderboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topThreeCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  topThreeRank: {
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userStreak: {
    color: '#94A3B8',
    fontSize: 12,
  },
  userPoints: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  yourRankCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  yourRankTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  yourRankText: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  confessionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    height: 120,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});