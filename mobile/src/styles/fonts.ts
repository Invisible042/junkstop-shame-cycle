import { Platform } from 'react-native';

// Modern font system using Inter font family
export const fonts = {
  // Font families
  family: {
    regular: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: 'Inter',
    }),
    medium: Platform.select({
      ios: 'Inter-Medium',
      android: 'Inter-Medium',
      default: 'Inter',
    }),
    semiBold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'Inter',
    }),
    bold: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'Inter',
    }),
    extraBold: Platform.select({
      ios: 'Inter-ExtraBold',
      android: 'Inter-ExtraBold',
      default: 'Inter',
    }),
    black: Platform.select({
      ios: 'Inter-Black',
      android: 'Inter-Black',
      default: 'Inter',
    }),
  },

  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },

  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Predefined text styles for consistency
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fonts.family.black,
    fontSize: fonts.size['4xl'],
    fontWeight: fonts.weight.black,
    letterSpacing: fonts.letterSpacing.tight,
    lineHeight: fonts.lineHeight.tight,
  },
  h2: {
    fontFamily: fonts.family.extraBold,
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.extraBold,
    letterSpacing: fonts.letterSpacing.tight,
    lineHeight: fonts.lineHeight.tight,
  },
  h3: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  h4: {
    fontFamily: fonts.family.semiBold,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.semiBold,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },

  // Body text
  body: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.regular,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  bodyMedium: {
    fontFamily: fonts.family.medium,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.medium,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  bodyBold: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },

  // Small text
  small: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.regular,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  smallMedium: {
    fontFamily: fonts.family.medium,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  smallBold: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    letterSpacing: fonts.letterSpacing.normal,
    lineHeight: fonts.lineHeight.normal,
  },

  // Caption text
  caption: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.regular,
    letterSpacing: fonts.letterSpacing.wide,
    lineHeight: fonts.lineHeight.normal,
  },

  // Button text
  button: {
    fontFamily: fonts.family.semiBold,
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semiBold,
    letterSpacing: fonts.letterSpacing.wide,
    lineHeight: fonts.lineHeight.tight,
  },
  buttonSmall: {
    fontFamily: fonts.family.semiBold,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semiBold,
    letterSpacing: fonts.letterSpacing.wide,
    lineHeight: fonts.lineHeight.tight,
  },

  // Display text (for hero sections)
  display: {
    fontFamily: fonts.family.black,
    fontSize: fonts.size['6xl'],
    fontWeight: fonts.weight.black,
    letterSpacing: fonts.letterSpacing.tight,
    lineHeight: fonts.lineHeight.tight,
  },
  displayLarge: {
    fontFamily: fonts.family.black,
    fontSize: fonts.size['5xl'],
    fontWeight: fonts.weight.black,
    letterSpacing: fonts.letterSpacing.tight,
    lineHeight: fonts.lineHeight.tight,
  },
  displayMedium: {
    fontFamily: fonts.family.extraBold,
    fontSize: fonts.size['4xl'],
    fontWeight: fonts.weight.extraBold,
    letterSpacing: fonts.letterSpacing.tight,
    lineHeight: fonts.lineHeight.tight,
  },
};

// Helper function to get font style
export const getFontStyle = (style: keyof typeof textStyles) => {
  return textStyles[style];
};

// Helper function to create custom font style
export const createFontStyle = (
  family: keyof typeof fonts.family,
  size: keyof typeof fonts.size,
  weight: keyof typeof fonts.weight = 'regular',
  letterSpacing: keyof typeof fonts.letterSpacing = 'normal',
  lineHeight: keyof typeof fonts.lineHeight = 'normal'
) => ({
  fontFamily: fonts.family[family],
  fontSize: fonts.size[size],
  fontWeight: fonts.weight[weight],
  letterSpacing: fonts.letterSpacing[letterSpacing],
  lineHeight: fonts.lineHeight[lineHeight],
}); 