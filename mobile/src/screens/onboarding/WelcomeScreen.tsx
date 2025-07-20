import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  Easing,
  StatusBar,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onNext: (goal?: string) => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const goals = [
    {
      id: 'awareness',
      title: 'Build Awareness',
      description: 'Track your junk food habits and understand your patterns',
      icon: 'analytics-outline',
      gradient: ['#4CAF50', '#45a049'],
      emoji: '📊'
    },
    {
      id: 'streak_breaking',
      title: 'Break the Cycle',
      description: 'Build streaks of healthy eating and break bad habits',
      icon: 'flame-outline',
      gradient: ['#FF9800', '#F57C00'],
      emoji: '🔥'
    },
    {
      id: 'community_support',
      title: 'Community Support',
      description: 'Connect with others on the same journey',
      icon: 'people-outline',
      gradient: ['#2196F3', '#1976D2'],
      emoji: '👥'
    },
    {
      id: 'savings',
      title: 'Save Money',
      description: 'Track spending and save on unhealthy food',
      icon: 'wallet-outline',
      gradient: ['#9C27B0', '#7B1FA2'],
      emoji: '💰'
    },
    {
      id: 'motivation',
      title: 'Stay Motivated',
      description: 'Earn achievements and track your progress',
      icon: 'trophy-outline',
      gradient: ['#E91E63', '#C2185B'],
      emoji: '🏆'
    }
  ];

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    
    // Animate button
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    Animated.timing(buttonScale, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      onNext(selectedGoal);
    });
  };

  // Responsive sizing
  const isSmallScreen = screenHeight < 700;
  const isLargeScreen = screenHeight > 800;
  
  const logoSize = isSmallScreen ? 80 : isLargeScreen ? 120 : 100;
  const titleSize = isSmallScreen ? 28 : isLargeScreen ? 40 : 36;
  const subtitleSize = isSmallScreen ? 14 : isLargeScreen ? 18 : 16;
  const sectionTitleSize = isSmallScreen ? 22 : isLargeScreen ? 32 : 28;
  const goalCardPadding = isSmallScreen ? 16 : 20;
  const goalIconSize = isSmallScreen ? 50 : 60;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: screenHeight }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingTop: isSmallScreen ? 40 : 80,
              paddingBottom: isSmallScreen ? 24 : 40,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                marginBottom: isSmallScreen ? 16 : 24,
              },
            ]}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626'] as [string, string]}
              style={[
                styles.logoGradient,
                {
                  width: logoSize,
                  height: logoSize,
                  borderRadius: logoSize / 2,
                }
              ]}
            >
              <Ionicons name="fast-food" size={logoSize * 0.48} color="#ffffff" />
            </LinearGradient>
          </Animated.View>
          
          <Text style={[
            styles.title,
            { fontSize: titleSize }
          ]}>Welcome to JunkStop</Text>
          <Text style={[
            styles.subtitle,
            { fontSize: subtitleSize }
          ]}>
            Your journey to healthier eating starts now
          </Text>
        </Animated.View>

        {/* Goal Selection */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingHorizontal: isSmallScreen ? 16 : 24,
              paddingBottom: isSmallScreen ? 24 : 40,
            },
          ]}
        >
          <View style={styles.goalSection}>
            <Text style={[
              styles.sectionTitle,
              { fontSize: sectionTitleSize }
            ]}>What's your main goal?</Text>
            <Text style={[
              styles.sectionSubtitle,
              { fontSize: isSmallScreen ? 14 : 16 }
            ]}>
              We'll personalize your experience based on your choice
            </Text>

            <View style={styles.goalsGrid}>
              {goals.map((goal, index) => (
                <Animated.View
                  key={goal.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30 + index * 20, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.goalCard,
                      { padding: goalCardPadding },
                      selectedGoal === goal.id && styles.selectedGoalCard,
                    ]}
                    onPress={() => handleGoalSelect(goal.id)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={goal.gradient as [string, string]}
                      style={[
                        styles.goalIconContainer,
                        {
                          width: goalIconSize,
                          height: goalIconSize,
                          borderRadius: goalIconSize / 2,
                        },
                        selectedGoal === goal.id && styles.selectedIconContainer,
                      ]}
                    >
                      <Text style={[
                        styles.emoji,
                        { fontSize: isSmallScreen ? 20 : 24 }
                      ]}>{goal.emoji}</Text>
                    </LinearGradient>
                    
                    <View style={styles.goalContent}>
                      <Text style={[
                        styles.goalTitle,
                        { fontSize: isSmallScreen ? 16 : 18 }
                      ]}>{goal.title}</Text>
                      <Text style={[
                        styles.goalDescription,
                        { fontSize: isSmallScreen ? 12 : 14 }
                      ]}>
                        {goal.description}
                      </Text>
                    </View>

                    {selectedGoal === goal.id && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                selectedGoal && styles.activeContinueButton,
              ]}
              onPress={handleContinue}
              disabled={!selectedGoal}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={selectedGoal ? ['#ef4444', '#dc2626'] : ['#374151', '#4B5563']}
                style={styles.buttonGradient}
              >
                <Text style={styles.continueText}>
                  {selectedGoal ? 'Continue' : 'Select a goal'}
                </Text>
                {selectedGoal && (
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.arrowIcon} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => onNext()}
            activeOpacity={0.6}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  goalSection: {
    flex: 1,
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  goalsGrid: {
    gap: 16,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: '#ef4444',
  },
  goalIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 24,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  goalDescription: {
    color: '#9ca3af',
    lineHeight: 20,
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  activeContinueButton: {
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
}); 