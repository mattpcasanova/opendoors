/**
 * Design System - Spacing
 * Standardized spacing scale based on 4px grid system
 * Use these values for padding, margin, and gap properties
 */

export const Spacing = {
  // Base unit: 4px
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,

  // Common patterns
  none: 0,
  tiny: 2,
  base: 12,
  section: 20,
  screen: 28,
} as const;

export type SpacingKey = keyof typeof Spacing;
