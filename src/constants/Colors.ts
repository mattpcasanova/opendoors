/**
 * Design System - Colors
 * Standardized color palette for the OpenDoors app
 * Based on teal brand color #14b8a6
 */

export const Colors = {
  // Brand Colors (Primary - Teal)
  primary: '#14b8a6',
  primaryLight: '#5eead4',
  primaryDark: '#0d9488',
  primaryMuted: 'rgba(20, 184, 166, 0.12)',

  // Secondary Colors (Orange)
  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',

  // Accent Colors
  accent: '#3F51B5',
  accentLight: '#7986CB',

  // Neutral Colors (Grays)
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Status Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',

  // Background Gradients
  backgroundGradient: ['#F9FAFB', '#E8F5F4'],
  primaryGradient: ['#14b8a6', '#0d9488'],
  secondaryGradient: ['#FF9800', '#F57C00'],

  // UI Element Colors
  border: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  borderDark: 'rgba(0, 0, 0, 0.12)',

  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',

  // Glass/Blur Effects
  glassBackground: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
} as const;

// Helper type for color keys
export type ColorKey = keyof typeof Colors; 