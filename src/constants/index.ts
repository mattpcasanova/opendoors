/**
 * Design System - Central Export
 * Import all design system constants from one place
 *
 * Usage:
 * import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants';
 */

export { Colors } from './Colors';
export type { ColorKey } from './Colors';

export { Spacing } from './Spacing';
export type { SpacingKey } from './Spacing';

export { Typography, TextStyles } from './Typography';
export type { FontSizeKey, FontWeightKey, LineHeightKey, TextStyleKey } from './Typography';

export { Shadows, BorderRadius, getPlatformShadow } from './Shadows';
export type { ShadowKey, BorderRadiusKey } from './Shadows';

// Common animation durations (in milliseconds)
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

// Common blur intensities for BlurView
export const BlurIntensity = {
  light: 60,
  medium: 80,
  strong: 95,
  veryStrong: 100,
} as const;

// Haptic feedback types (for future implementation)
export const HapticType = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;
