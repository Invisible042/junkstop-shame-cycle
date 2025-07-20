# Modern Font System

## Overview
This app uses a modern, consistent typography system based on the Inter font family. The system provides predefined text styles and utility functions for maintaining consistent typography across the entire application.

## Font Family
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: System fonts (San Francisco on iOS, Roboto on Android)

## Font Weights
- `regular` (400)
- `medium` (500) 
- `semiBold` (600)
- `bold` (700)
- `extraBold` (800)
- `black` (900)

## Font Sizes
- `xs`: 12px
- `sm`: 14px
- `base`: 16px
- `lg`: 18px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 28px
- `4xl`: 32px
- `5xl`: 36px
- `6xl`: 48px

## Predefined Text Styles

### Headings
- `h1`: Large display text (32px, Black weight)
- `h2`: Main headings (28px, ExtraBold weight)
- `h3`: Section headings (24px, Bold weight)
- `h4`: Subsection headings (20px, SemiBold weight)

### Body Text
- `body`: Regular body text (16px, Regular weight)
- `bodyMedium`: Medium body text (16px, Medium weight)
- `bodyBold`: Bold body text (16px, Bold weight)

### Small Text
- `small`: Small text (14px, Regular weight)
- `smallMedium`: Medium small text (14px, Medium weight)
- `smallBold`: Bold small text (14px, Bold weight)

### Specialized
- `caption`: Caption text (12px, Regular weight, wide letter spacing)
- `button`: Button text (18px, SemiBold weight, wide letter spacing)
- `buttonSmall`: Small button text (16px, SemiBold weight)
- `display`: Hero display text (48px, Black weight)
- `displayLarge`: Large display text (36px, Black weight)
- `displayMedium`: Medium display text (32px, ExtraBold weight)

## Usage

### Using Predefined Styles
```tsx
import { textStyles } from '../styles/fonts';

<Text style={[textStyles.h2, { color: theme.text }]}>
  Your Journey
</Text>
```

### Using ModernText Component
```tsx
import ModernText, { Heading2, BodyText } from '../components/ModernText';

// Using variant
<ModernText variant="h2" style={{ color: theme.text }}>
  Your Journey
</ModernText>

// Using convenience components
<Heading2 style={{ color: theme.text }}>Your Journey</Heading2>
<BodyText>Track your progress</BodyText>
```

### Creating Custom Styles
```tsx
import { createFontStyle } from '../styles/fonts';

const customStyle = createFontStyle('bold', 'xl', 'bold', 'wide', 'normal');
```

## Implementation Notes

### Recent Updates
- **Progress Screen**: Updated header to "Your Journey" with trending icon
- **Community Screen**: Updated header to "Community Hub" with people icon
- **Typography**: Implemented Inter font family throughout the app
- **Consistency**: All headings now use consistent font weights and spacing

### Benefits
1. **Consistency**: All text follows the same design system
2. **Maintainability**: Easy to update fonts globally
3. **Performance**: Optimized font loading and rendering
4. **Accessibility**: Proper font weights and sizes for readability
5. **Professional**: Modern, clean typography that enhances the app's credibility

## Future Enhancements
- Add font loading optimization
- Implement dynamic font scaling for accessibility
- Add more specialized text styles as needed
- Consider adding font variants for different themes 