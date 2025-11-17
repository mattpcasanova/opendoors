/**
 * Design System - Shadows & Elevation
 * Standardized shadow styles for depth and elevation
 * iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius
 * Android uses elevation
 */

import { Platform, ViewStyle } from 'react-native';

export const Shadows = {
  // Shadow levels (iOS + Android)
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  // Colored shadows (for primary elements)
  primarySm: {
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },

  primaryMd: {
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryLg: {
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Border Radius values
export const BorderRadius = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

// Helper function to get platform-specific shadow
export const getPlatformShadow = (level: keyof typeof Shadows): ViewStyle => {
  const shadow = Shadows[level];

  if (Platform.OS === 'android') {
    return {
      elevation: shadow.elevation,
    };
  }

  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
  };
};

export type ShadowKey = keyof typeof Shadows;
export type BorderRadiusKey = keyof typeof BorderRadius;
