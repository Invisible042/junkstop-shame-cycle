import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

interface MoodBarProps {
  logs: { guiltRating?: number; guilt_rating?: number }[];
  theme: any;
}

function getBarColor(percent: number) {
  if (percent === 0) return '#10B981'; // bright green for 0%
  if (percent <= 0.3) return '#34D399'; // light green
  if (percent <= 0.5) return '#F59E0B'; // orange (50% threshold)
  if (percent <= 0.75) return '#F97316'; // dark orange
  return '#EF4444'; // red for high percentage
}

function getMessage(percent: number) {
  if (percent === 0) return 'Great start! No junk food logged.';
  if (percent <= 0.3) return 'Nice! Stay mindful.';
  if (percent <= 0.5) return 'Hmm, let\'s think about this...';
  if (percent <= 0.75) return 'Careful, try to cut back.';
  return 'Let\'s reset and try again!';
}

function getEmojiAnimation(percent: number) {
  if (percent === 0) return require('../../assets/lottie/Emoji_happy.json');
  if (percent <= 0.3) return require('../../assets/lottie/Emoji_happy.json');
  if (percent <= 0.5) return require('../../assets/lottie/Emoji_thinking.json');
  if (percent <= 0.75) return require('../../assets/lottie/Emoji_sad.json');
  return require('../../assets/lottie/Emoji_crying.json');
}

export default function MoodBar({ logs, theme }: MoodBarProps) {
  const maxGuilt = logs.length > 0 ? logs.reduce((a, b) => a + (b.guiltRating || b.guilt_rating || 0), 0) : 0;
  const percent = logs.length > 0 ? Math.min(maxGuilt / (logs.length * 5 || 1), 1) : 0;
  const percentText = percent === 0 ? '0% logged' : `${Math.round(percent * 100)}% junk food logged`;

  // Animated fill width
  const fillAnim = useRef(new Animated.Value(percent)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: percent,
      duration: 800,
      useNativeDriver: false,
      easing: Easing.out(Easing.exp),
    }).start();
  }, [percent]);

  const barColor = getBarColor(percent);
  const animatedWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const emojiSource = getEmojiAnimation(percent);

  return (
    <View style={[styles.cardWrap, { backgroundColor: theme.cardBg }]}>
      <View style={styles.messageBoxWrap}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{getMessage(percent)}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <LottieView
          source={emojiSource}
          autoPlay
          loop
          style={{ width: 80, height: 80, marginLeft: -8 }}
        />
        <View style={[styles.barBg, theme.cardShadow, { backgroundColor: theme.moodBarBg }]}>
          <Animated.View style={[styles.barFill, { backgroundColor: barColor, width: animatedWidth }]} />
          <View style={styles.percentContainer} pointerEvents="none">
            <Text style={[styles.percentText, { color: percent === 0 ? '#10B981' : '#1F2937' }]}>{percentText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 18,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 0,
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  messageBoxWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 8,
    shadowColor: '#009e60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  messageText: {
    color: '#00703c',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    justifyContent: 'flex-start',
    width: '100%',
    paddingBottom: 20,
  },
  barBg: {
    width: '69%',
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e0e7ff',
    position: 'relative',
    marginLeft: 4,
    marginRight: 20,
  },
  barFill: {
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  percentContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 