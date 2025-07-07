import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, buttonStyle } from '../../styles/theme';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>JunkStop</Text>
      <Text style={styles.headline}>Break the Junk Food Cycle!</Text>
      <Text style={styles.valueProp}>Track your habits, stay motivated, and join a supportive community. Your journey starts here.</Text>
      <TouchableOpacity
        style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.lg }]}
        onPress={() => navigation.navigate('FeatureHighlight')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fontSizes.body }}>Get Started</Text>
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
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  valueProp: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
}); 