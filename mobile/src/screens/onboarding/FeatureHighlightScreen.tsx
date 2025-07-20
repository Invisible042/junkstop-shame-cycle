import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface FeatureHighlightScreenProps {
  onNext: () => void;
}

export default function FeatureHighlightScreen({ onNext }: FeatureHighlightScreenProps) {
  const { theme } = useTheme();

  const features = [
    {
      icon: 'camera',
      title: 'Photo Accountability',
      description: 'Take photos of your food to stay accountable and track your progress visually',
      color: '#4CAF50'
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'AI Coach',
      description: 'Get personalized insights and motivation from our AI-powered coach',
      color: '#2196F3'
    },
    {
      icon: 'analytics',
      title: 'Smart Analytics',
      description: 'Track patterns, guilt levels, and progress with detailed insights',
      color: '#FF9800'
    },
    {
      icon: 'people',
      title: 'Community Support',
      description: 'Coming soon! Connect with others on the same journey',
      color: '#9C27B0'
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy First',
      description: 'Your data stays private and secure. Share only what you want',
      color: '#E91E63'
    },
    {
      icon: 'trophy',
      title: 'Achievement System',
      description: 'Earn badges and celebrate milestones on your journey',
      color: '#FFC107'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Why Choose JunkStop?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Everything you need to break free from junk food addiction
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { backgroundColor: theme.cardBg }]}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                <Ionicons name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        <View style={[styles.statsContainer, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>Join Our Community</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>10K+</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>85%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>4.8★</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>User Rating</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.accent }]}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.continueText, { color: '#fff' }]}>
            Get Started
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 