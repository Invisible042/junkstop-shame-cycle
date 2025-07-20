import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CoachFeedbackProps {
  logs: { regretRating?: number; regret_rating?: number }[];
  theme: any;
}

export default function CoachFeedback({ logs, theme }: CoachFeedbackProps) {
  const highRegret = logs.filter((l) => (l.regretRating || l.regret_rating || 0) >= 4).length;
  let text = '';
  if (highRegret === 0) text = "Great job! No high-regret logs today.";
  else if (highRegret === 1) text = "You had 1 high-guilt log today. Want a reset plan?";
  else text = `You had ${highRegret} high-guilt logs today. Want a reset plan?`;
  return (
    <View style={[styles.card, theme.cardShadow, { backgroundColor: theme.cardBg }]}> 
      <Text style={styles.emoji}>😟</Text>
      <Text style={[styles.title, { color: theme.text }]}>AI Coach says…</Text>
      <Text style={[styles.text, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  text: { fontSize: 16, textAlign: 'center' },
}); 