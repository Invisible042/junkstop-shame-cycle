import { ViewStyle } from 'react-native';

export const colors = {
  background: '#181c2f',
  card: '#23263a',
  border: '#2d314d',
  text: '#fff',
  textSecondary: '#e0e0e0',
  accent: '#ef4444',
  green: '#27ae60',
  blue: '#3498db',
  yellow: '#ffd700',
  gray: '#888',
  inputBg: '#23263a',
  inputBorder: '#2d314d',
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