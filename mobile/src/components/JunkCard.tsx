import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Animated as RNAnimated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JunkCardProps {
  log: {
    name?: string;
    regretRating?: number;
    guilt_rating?: number;
    date?: string;
    time?: string;
    photo_url?: string;
    estimated_calories?: number;
    ai_motivation?: string;
  };
  theme: any;
  onPress?: (log: any) => void;
}

const foodEmojis: Record<string, string> = {
  burger: '🍔', pizza: '🍕', cake: '🧁', fries: '🍟', donut: '🍩', soda: '🥤', chocolate: '🍫', candy: '🍬', popcorn: '🍿', milkshake: '🥤', ice_cream: '🍦', cupcake: '🧁', default: '🍽️'
};

function getEmojiForFoodType(foodType?: string): string {
  if (!foodType) return foodEmojis.default;
  const type = foodType.toLowerCase();
  for (const key of Object.keys(foodEmojis)) {
    if (key !== 'default' && type.includes(key.replace('_', ''))) {
      return foodEmojis[key];
    }
  }
  return foodEmojis.default;
}

export default function JunkCard({ log, theme, onPress }: JunkCardProps) {
  const regret = log.regretRating || 0;
  const guilt = log.guilt_rating || 0;
  const fill = Math.min(regret / 5, 1);
  const [flipped, setFlipped] = React.useState(false);
  const flipAnim = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    RNAnimated.timing(flipAnim, {
      toValue: flipped ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [flipped]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${fill * 100}%`, { duration: 600 }),
  }));

  const emoji = getEmojiForFoodType(log.name);

  // Format date/time if present
  const dateTime = log.date && log.time ? `${log.date} • ${log.time}` : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, theme.cardShadow, { backgroundColor: theme.cardBg }]}
      onPress={() => setFlipped(f => !f)}
    >
      {/* Card front */}
      <RNAnimated.View style={[{
        backfaceVisibility: 'hidden',
        transform: [{ rotateY: frontInterpolate }],
        position: flipped ? 'absolute' : 'relative',
        width: '100%',
      }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={{ flex: 1, justifyContent: 'center', minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">{log.name}</Text>
              {log.photo_url && (
                <Image source={{ uri: log.photo_url }} style={{ width: 32, height: 32, borderRadius: 6, marginLeft: 8 }} />
              )}
            </View>
            {dateTime && <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 2 }}>{dateTime}</Text>}
            <View style={styles.regretRow}>
              <Text style={styles.regretLabel}>Regret:</Text>
              <View style={styles.regretBarBg}>
                <Animated.View style={[styles.regretBarFill, animatedStyle, { backgroundColor: theme.regretBar }]} />
              </View>
              <Text style={styles.regretScore}>{regret}</Text>
              <Text style={{ marginLeft: 8, color: theme.textSecondary }}>Guilt: {guilt}</Text>
            </View>
            {log.estimated_calories !== undefined && (
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Calories: {log.estimated_calories}</Text>
            )}
          </View>
          {/* Flip/toggle icon indicator */}
          <Ionicons name="sync" size={22} color={theme.textSecondary} style={{ marginLeft: 10, marginRight: 2, opacity: 0.7 }} />
        </View>
      </RNAnimated.View>
      {/* Card back (AI insight/alternative) */}
      <RNAnimated.View style={[{
        backfaceVisibility: 'hidden',
        position: flipped ? 'relative' : 'absolute',
        width: '100%',
        top: 0,
        left: 0,
        transform: [{ rotateY: backInterpolate }],
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }]}
      >
        <Text style={[styles.name, { color: theme.text, textAlign: 'center' }]}>AI Suggestion</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center', marginVertical: 8 }}>
          {log.ai_motivation || 'No AI suggestion available yet.'}
        </Text>
        <Text style={{ color: theme.accent, fontWeight: 'bold', marginTop: 8 }}>Tap to flip back</Text>
      </RNAnimated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 6,
    backgroundColor: '#fff',
  },
  emoji: { fontSize: 36, marginRight: 12 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  regretRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  regretLabel: { fontSize: 15, marginRight: 8 },
  regretBarBg: { minWidth: 60, maxWidth: 100, width: '30%', height: 14, borderRadius: 7, backgroundColor: '#e0e7ff', marginHorizontal: 6, overflow: 'hidden', flexShrink: 1 },
  regretBarFill: { height: 14, borderRadius: 7 },
  regretScore: { fontSize: 15, marginLeft: 8, fontWeight: 'bold' },
}); 