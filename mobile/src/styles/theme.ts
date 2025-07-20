import { ViewStyle } from 'react-native';
import { fonts } from './fonts';

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

// Import modern font system
export { fonts, textStyles } from './fonts';

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

export const darkTheme = {
  ...colors,
  cardBg: colors.card,
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  text: colors.text,
  textSecondary: colors.textSecondary,
  accent: colors.accent,
  accentText: '#fff',
  outline: colors.accent,
  moodBarBg: '#23263a',
  moodBarFill: colors.yellow,
  regretBar: colors.yellow,
  inputBg: colors.inputBg,
  inputBorder: colors.inputBorder,
  button: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  outlineButton: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  outlineButtonText: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 18,
  },
  gray: colors.gray,
  green: colors.green,
  blue: colors.blue,
  yellow: colors.yellow,
};

export const lightTheme = {
  background: '#77BEF0',
  backgroundGradient: ['#77BEF0', '#b3e3fc'], // soft blue gradient
  cardBg: '#FFF2F2',
  cardShadow: {
    shadowColor: '#77BEF0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  text: '#222b45',
  textSecondary: '#5a627a',
  accent: '#3b82f6',
  accentText: '#fff',
  outline: '#3b82f6',
  moodBarBg: '#e0e7ff',
  moodBarFill: '#ffd166',
  regretBar: '#ffd166',
  inputBg: '#FFF2F2',
  inputBorder: '#e0e7ff',
  button: {
    backgroundColor: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: fonts.family.semiBold,
    letterSpacing: 0.5,
  },
  outlineButton: {
    backgroundColor: '#FFF2F2',
    borderColor: '#3b82f6',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    marginVertical: 10,
  },
  outlineButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: fonts.family.semiBold,
    letterSpacing: 0.5,
  },
  gray: '#b0b0b8',
  green: '#2ecc71',
  blue: '#3b82f6',
  yellow: '#ffd166',
  fontFamily: fonts.family.regular,
}; 