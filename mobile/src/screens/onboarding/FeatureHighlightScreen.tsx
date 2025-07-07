import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, buttonStyle } from '../../styles/theme';

const features = [
  {
    icon: 'flame-outline',
    color: colors.yellow,
    title: 'Streaks',
    desc: 'Stay motivated by building your clean days streak and unlocking badges.'
  },
  {
    icon: 'sparkles-outline',
    color: colors.green,
    title: 'AI Insights',
    desc: 'Get daily, personalized insights to help you break the cycle.'
  },
  {
    icon: 'chatbubbles-outline',
    color: colors.blue,
    title: 'Community',
    desc: 'Share progress, get support, and celebrate wins together.'
  }
];

export default function FeatureHighlightScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>What makes JunkStop special?</Text>
      {features.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Ionicons name={f.icon as any} size={32} color={f.color} style={{ marginRight: spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.lg }]}
        onPress={() => navigation.navigate('FinishOnboarding')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fontSizes.body }}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  headline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  featureDesc: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
}); 