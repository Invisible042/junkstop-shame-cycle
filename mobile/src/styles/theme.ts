import { ViewStyle } from 'react-native';

export const colors = {
  background: '#18181b', // app background (very dark)
  card: '#23263a',      // lighter dark for cards
  lightGray: '#2a2a31', // even lighter for card surfaces and nav
  border: '#26272b',
  text: '#f4f4f5',
  textSecondary: '#b0b0b8',
  accent: '#e74c3c',
  green: '#2ecc71',
  blue: '#3b82f6',
  yellow: '#f1c40f',
  gray: '#888',
  inputBg: '#232323',
  inputBorder: '#26272b',
};

export const spacing = {
  xs: 6,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
};

export const fontSizes = {
  heading: 28,
  subheading: 20,
  body: 16,
  small: 13,
};

export const cardStyle = {
  backgroundColor: colors.card,
  borderRadius: 16,
  padding: spacing.lg,
  marginBottom: spacing.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

export const buttonStyle: ViewStyle = {
  borderRadius: 24,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xl,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
}; 