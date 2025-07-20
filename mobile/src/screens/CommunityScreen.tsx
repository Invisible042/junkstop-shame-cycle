import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { apiRequest } from '../utils/api';
import { textStyles } from '../styles/fonts';

export default function CommunityScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const communityFeatures = [
    {
      id: 'anonymous_sharing',
      title: 'Anonymous Sharing',
      description: 'Share your struggles and victories without revealing your identity',
      icon: 'shield-outline',
      color: '#4CAF50'
    },
    {
      id: 'peer_support',
      title: 'Peer Support',
      description: 'Connect with others on the same journey for motivation',
      icon: 'people-outline',
      color: '#2196F3'
    },
    {
      id: 'group_challenges',
      title: 'Group Challenges',
      description: 'Join challenges with others to stay accountable',
      icon: 'trophy-outline',
      color: '#FF9800'
    },
    {
      id: 'expert_advice',
      title: 'Expert Advice',
      description: 'Get tips from nutritionists and wellness coaches',
      icon: 'medical-outline',
      color: '#9C27B0'
    },
    {
      id: 'progress_sharing',
      title: 'Progress Sharing',
      description: 'Share your before/after photos and milestones',
      icon: 'trending-up-outline',
      color: '#E91E63'
    },
    {
      id: 'local_meetups',
      title: 'Local Meetups',
      description: 'Find and organize local support groups',
      icon: 'location-outline',
      color: '#FFC107'
    }
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSubmitSurvey = async () => {
    if (selectedFeatures.length === 0) {
      Alert.alert('Features Required', 'Please select at least one feature you\'re interested in.');
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, just show success - you can add backend integration later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      Alert.alert(
        'Thank You! 🎉',
        'Your feedback has been submitted. We\'ll prioritize the features you selected!',
        [{ text: 'OK' }]
      );
      setSelectedFeatures([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.background }]}> 
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="people" size={32} color={theme.accent} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>COMMUNITY</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Join The Movement
            </Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Spacer for fixed header */}
        <View style={{ height: 120 }} />
        {/* Coming Soon Banner */}
        <View style={[styles.comingSoonBanner, { backgroundColor: theme.accent + '15' }]}> 
          <Ionicons name="rocket-outline" size={24} color={theme.accent} />
          <Text style={[styles.comingSoonText, { color: theme.accent }]}>Coming Soon - We're building something amazing!</Text>
        </View>
        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            What would you like to see?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Select the features you're most interested in
          </Text>
          
          <View style={styles.featuresGrid}>
            {communityFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureCard,
                  { 
                    backgroundColor: selectedFeatures.includes(feature.id) 
                      ? feature.color + '15' 
                      : theme.cardBg,
                    borderColor: selectedFeatures.includes(feature.id) 
                      ? feature.color 
                      : theme.inputBorder,
                    borderWidth: selectedFeatures.includes(feature.id) ? 2 : 1,
                  }
                ]}
                onPress={() => toggleFeature(feature.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                  {feature.description}
                </Text>
                {selectedFeatures.includes(feature.id) && (
                  <View style={[styles.selectedIndicator, { backgroundColor: feature.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback Section */}
        <View style={[styles.waitlistSection, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Help Us Build
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Select the features you'd like to see first
          </Text>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: isSubmitting ? theme.textSecondary : theme.accent,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmitSurvey}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsSection, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Development Progress
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>85%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Want Anonymous Sharing</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>72%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Want Peer Support</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>Q2 2024</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Target Launch</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 4,
    // marginTop is now set inline for the fixed header
  },
  headerTitle: {
    fontFamily: textStyles.h1.fontFamily,
    fontSize: 32, // Much larger text
    fontWeight: '900', // Extra bold
    letterSpacing: 1,
    lineHeight: 36,
    marginBottom: 8,
    color: '#1F2937', // Dark text for better visibility
    textShadowColor: 'rgba(255, 255, 255, 1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontFamily: textStyles.h3.fontFamily,
    fontSize: 18, // Much larger subtitle
    fontWeight: '600', // Semi-bold
    letterSpacing: 0.5,
    lineHeight: 22,
    opacity: 1, // Full opacity
    color: '#4B5563', // Darker, more visible color
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitlistSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});