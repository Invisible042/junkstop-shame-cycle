import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, buttonStyle } from '../../styles/theme';

export default function FinishOnboardingScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <View style={styles.container}>
      <Ionicons name="trophy-outline" size={60} color={colors.green} style={{ marginBottom: spacing.lg }} />
      <Text style={styles.headline}>You’re ready to break the cycle!</Text>
      <Text style={styles.subtext}>Stay motivated, log your progress, and join the community. Let’s do this together!</Text>
      <TouchableOpacity
        style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.xl }]}
        onPress={onFinish}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fontSizes.body }}>Start Using JunkStop</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.green,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtext: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
}); 