import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface FinishOnboardingScreenProps {
  onFinish: () => void;
}

export default function FinishOnboardingScreen({ onFinish }: FinishOnboardingScreenProps) {
  const { theme } = useTheme();

  const nextSteps = [
    {
      icon: 'camera',
      title: 'Log Your First Food',
      description: 'Start by logging your next junk food with a photo',
      color: '#4CAF50'
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'Chat with AI Coach',
      description: 'Get personalized advice and motivation',
      color: '#2196F3'
    },
    {
      icon: 'analytics',
      title: 'Check Your Progress',
      description: 'View your patterns and insights',
      color: '#FF9800'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.successIcon, { backgroundColor: theme.accent + '15' }]}>
            <Ionicons name="checkmark-circle" size={64} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>You're All Set!</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Welcome to your journey towards healthier eating habits
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            What's Next?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Here's how to get started
          </Text>

          <View style={styles.nextStepsList}>
            {nextSteps.map((step, index) => (
              <View key={index} style={[styles.stepCard, { backgroundColor: theme.cardBg }]}>
                <View style={[styles.stepIcon, { backgroundColor: step.color + '15' }]}>
                  <Ionicons name={step.icon as any} size={24} color={step.color} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                    {step.description}
                  </Text>
                </View>
                <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Motivation Quote */}
        <View style={[styles.quoteContainer, { backgroundColor: theme.cardBg }]}>
          <Ionicons name="heart" size={24} color={theme.accent} style={styles.quoteIcon} />
          <Text style={[styles.quoteText, { color: theme.text }]}>
            "Every journey begins with a single step. You've just taken yours."
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
            - Your Future Self
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.accent }]}
          onPress={onFinish}
          activeOpacity={0.8}
        >
          <Text style={[styles.startButtonText, { color: '#fff' }]}>
            Start My Journey
          </Text>
          <Ionicons name="rocket" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  nextStepsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  nextStepsList: {
    gap: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quoteContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});