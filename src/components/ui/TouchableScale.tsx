/**
 * TouchableScale Component
 * A touchable component with scale animation feedback
 * Provides consistent micro-interactions across the app
 */

import React, { useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AnimationDuration } from '../../constants';

interface TouchableScaleProps extends TouchableOpacityProps {
  /** Scale value when pressed (default: 0.96) */
  scaleValue?: number;
  /** Enable haptic feedback (default: true) */
  hapticFeedback?: boolean;
  /** Haptic feedback style (default: 'light') */
  hapticStyle?: 'light' | 'medium' | 'heavy';
  /** Animation duration in ms (default: 150) */
  duration?: number;
  /** Children components */
  children: React.ReactNode;
}

export const TouchableScale: React.FC<TouchableScaleProps> = ({
  scaleValue = 0.96,
  hapticFeedback = true,
  hapticStyle = 'light',
  duration = AnimationDuration.fast,
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    // Trigger haptic feedback
    if (hapticFeedback) {
      const hapticType = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[hapticStyle];

      Haptics.impactAsync(hapticType);
    }

    // Animate scale down
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration,
      useNativeDriver: true,
    }).start();

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    // Animate scale back to normal
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();

    onPressOut?.(event);
  };

  const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={style}
      {...props}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </TouchableOpacity>
  );
};
