/**
 * LoadingSpinner Component
 * Branded loading indicator to replace default ActivityIndicator
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, Easing } from 'react-native';
import { Colors, Spacing } from '../../constants';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Custom color (default: primary) */
  color?: string;
  /** Custom container style */
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = Colors.primary,
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[{ padding: Spacing.md }, style]}>
      <Animated.View
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderWidth: 3,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: color,
          transform: [{ rotate: spin }],
        }}
      />
    </View>
  );
};
