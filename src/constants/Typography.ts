/**
 * Design System - Typography
 * Standardized font sizes, weights, and line heights
 */

export const Typography = {
  // Font Sizes (based on modular scale)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
  },

  // Font Weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
} as const;

// Common text style combinations
export const TextStyles = {
  // Headers
  h1: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight,
  },
  h2: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight,
  },
  h3: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.snug,
  },
  h4: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.snug,
  },

  // Body
  bodyLarge: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.normal,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.normal,
  },

  // Labels & Captions
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.tight,
  },
  caption: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.normal,
  },

  // Buttons
  button: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.none,
    letterSpacing: Typography.letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.none,
  },
} as const;

export type FontSizeKey = keyof typeof Typography.fontSize;
export type FontWeightKey = keyof typeof Typography.fontWeight;
export type LineHeightKey = keyof typeof Typography.lineHeight;
export type TextStyleKey = keyof typeof TextStyles;
