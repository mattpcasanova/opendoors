/**
 * Button Component
 * Standardized button with consistent styling and interactions
 * Supports primary, secondary, and outline variants
 */

import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, TextStyles, Shadows, BorderRadius } from '../../constants';
import { TouchableScale } from './TouchableScale';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant (default: 'primary') */
  variant?: ButtonVariant;
  /** Size variant (default: 'medium') */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom icon (left side) */
  icon?: React.ReactNode;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  // Container styles based on variant
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      ...Shadows.sm,
    };

    // Size-specific padding
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.base,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        minHeight: 52,
      },
    };

    // Variant-specific styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: Colors.primary,
        ...Shadows.primarySm,
      },
      secondary: {
        backgroundColor: Colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
        shadowOpacity: 0,
        elevation: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(isDisabled && {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
      }),
    };
  };

  // Text styles based on variant and size
  const getTextStyle = (): TextStyle => {
    const baseTextStyle = size === 'small' ? TextStyles.buttonSmall : TextStyles.button;

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: Colors.white,
      },
      secondary: {
        color: Colors.white,
      },
      outline: {
        color: Colors.primary,
      },
      ghost: {
        color: Colors.primary,
      },
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableScale
      onPress={onPress}
      disabled={isDisabled}
      scaleValue={0.96}
      hapticFeedback={!isDisabled}
      hapticStyle="medium"
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableScale>
  );
};
