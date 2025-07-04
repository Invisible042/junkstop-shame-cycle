import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../styles/theme';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  const getBadgeContent = () => {
    if (streak === 0) {
      return { icon: "🧭", label: "Today's Streak" };
    } else if (streak <= 2) {
      return { icon: "🟡", label: `Streak: ${streak} Days` };
    } else if (streak <= 4) {
      return { icon: "🔵", label: `Streak: ${streak} Days` };
    } else if (streak <= 6) {
      return { icon: "🟢", label: `Streak: ${streak} Days` };
    } else {
      return { icon: "🔥", label: `Streak: ${streak} Days` };
    }
  };

  const { icon, label } = getBadgeContent();

  return (
    <View style={styles.badgeContainer}>
      <View style={styles.badge}>
        <Text style={styles.badgeIcon}>{icon}</Text>
        <Text style={styles.badgeLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 38, 58, 0.9)',
    borderRadius: 25,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    minWidth: 160,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  badgeLabel: {
    color: colors.text,
    fontSize: fontSizes.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 