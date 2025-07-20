import React from 'react';
import { Text, TextProps } from 'react-native';
import { textStyles, fonts } from '../styles/fonts';

interface ModernTextProps extends TextProps {
  variant?: keyof typeof textStyles;
  family?: keyof typeof fonts.family;
  size?: keyof typeof fonts.size;
  weight?: keyof typeof fonts.weight;
  children: React.ReactNode;
}

export default function ModernText({ 
  variant, 
  family, 
  size, 
  weight, 
  style, 
  children, 
  ...props 
}: ModernTextProps) {
  let textStyle = {};

  if (variant) {
    textStyle = textStyles[variant];
  } else if (family && size) {
    textStyle = {
      fontFamily: fonts.family[family],
      fontSize: fonts.size[size],
      fontWeight: weight ? fonts.weight[weight] : fonts.weight.regular,
    };
  }

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
}

// Convenience components for common text styles
export const Heading1 = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="h1" {...props} />
);

export const Heading2 = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="h2" {...props} />
);

export const Heading3 = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="h3" {...props} />
);

export const Heading4 = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="h4" {...props} />
);

export const BodyText = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="body" {...props} />
);

export const BodyMedium = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="bodyMedium" {...props} />
);

export const BodyBold = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="bodyBold" {...props} />
);

export const SmallText = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="small" {...props} />
);

export const CaptionText = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="caption" {...props} />
);

export const ButtonText = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="button" {...props} />
);

export const DisplayText = (props: Omit<ModernTextProps, 'variant'>) => (
  <ModernText variant="display" {...props} />
); 