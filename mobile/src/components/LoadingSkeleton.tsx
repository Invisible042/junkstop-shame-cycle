import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonBox: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8, 
  style 
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.inputBg,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.header, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width={120} height={24} style={styles.headerTitle} />
        <SkeletonBox width={80} height={16} style={styles.headerSubtitle} />
      </View>

      {/* Stats Cards Skeleton */}
      <View style={styles.statsContainer}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
            <SkeletonBox width={60} height={20} style={styles.statValue} />
            <SkeletonBox width={80} height={14} style={styles.statLabel} />
          </View>
        ))}
      </View>

      {/* Level Progress Skeleton */}
      <View style={[styles.levelCard, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width={100} height={24} style={styles.levelTitle} />
        <SkeletonBox width="100%" height={8} style={styles.progressBar} />
        <SkeletonBox width={60} height={16} style={styles.progressText} />
      </View>

      {/* Recent Logs Skeleton */}
      <View style={[styles.logsCard, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width={120} height={20} style={styles.sectionTitle} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.logItem}>
            <SkeletonBox width={80} height={16} style={styles.logName} />
            <SkeletonBox width={60} height={14} style={styles.logTime} />
          </View>
        ))}
      </View>
    </View>
  );
};

export const ProgressSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Level Progress Skeleton */}
      <View style={[styles.levelCard, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width={100} height={24} style={styles.levelTitle} />
        <SkeletonBox width="100%" height={8} style={styles.progressBar} />
        <SkeletonBox width={60} height={16} style={styles.progressText} />
      </View>

      {/* Achievements Skeleton */}
      <View style={[styles.achievementsCard, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width={120} height={20} style={styles.sectionTitle} />
        <View style={styles.achievementsGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.achievementItem}>
              <SkeletonBox width={40} height={40} borderRadius={20} style={styles.achievementIcon} />
              <SkeletonBox width={80} height={14} style={styles.achievementTitle} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const ChatSkeleton: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.chatHeader, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width={40} height={40} borderRadius={20} style={styles.avatar} />
        <View style={styles.headerText}>
          <SkeletonBox width={100} height={18} style={styles.chatTitle} />
          <SkeletonBox width={60} height={14} style={styles.chatSubtitle} />
        </View>
      </View>

      {/* Messages Skeleton */}
      <View style={styles.messagesContainer}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.messageBubble, { backgroundColor: theme.cardBg }]}>
            <SkeletonBox width={200} height={16} style={styles.messageText} />
            <SkeletonBox width={60} height={12} style={styles.messageTime} />
          </View>
        ))}
      </View>

      {/* Input Skeleton */}
      <View style={[styles.inputContainer, { backgroundColor: theme.cardBg }]}>
        <SkeletonBox width="100%" height={50} borderRadius={25} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    marginBottom: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 8,
  },
  statLabel: {
    marginBottom: 0,
  },
  levelCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  levelTitle: {
    marginBottom: 12,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    marginBottom: 0,
  },
  logsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logName: {
    marginBottom: 0,
  },
  logTime: {
    marginBottom: 0,
  },
  achievementsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    marginBottom: 8,
  },
  achievementTitle: {
    marginBottom: 0,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatar: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  chatTitle: {
    marginBottom: 4,
  },
  chatSubtitle: {
    marginBottom: 0,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageText: {
    marginBottom: 8,
  },
  messageTime: {
    marginBottom: 0,
  },
  inputContainer: {
    padding: 16,
    borderRadius: 16,
  },
}); 