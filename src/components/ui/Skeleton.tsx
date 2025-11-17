/**
 * Skeleton Component
 * Animated placeholder for loading states
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants';

interface SkeletonProps {
  /** Width of skeleton (number or percentage string) */
  width?: number | string;
  /** Height of skeleton */
  height?: number;
  /** Border radius (default: 'md') */
  borderRadius?: keyof typeof BorderRadius;
  /** Custom container style */
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 'md',
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: Colors.gray200,
          borderRadius: BorderRadius[borderRadius],
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * SkeletonCard Component
 * Pre-built skeleton for card layouts
 */
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.md,
          padding: Spacing.md,
          marginBottom: Spacing.md,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
        <Skeleton width={60} height={60} borderRadius="md" style={{ marginRight: Spacing.md }} />
        <View style={{ flex: 1 }}>
          <Skeleton width="70%" height={20} style={{ marginBottom: Spacing.sm }} />
          <Skeleton width="50%" height={16} />
        </View>
      </View>

      {/* Body */}
      <Skeleton width="100%" height={12} style={{ marginBottom: Spacing.xs }} />
      <Skeleton width="90%" height={12} style={{ marginBottom: Spacing.xs }} />
      <Skeleton width="60%" height={12} />
    </View>
  );
};

/**
 * SkeletonGameCard Component
 * Pre-built skeleton specifically for game cards
 */
export const SkeletonGameCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          marginHorizontal: Spacing.sm,
          width: 280,
        },
        style,
      ]}
    >
      {/* Company Logo */}
      <Skeleton
        width={80}
        height={80}
        borderRadius="full"
        style={{ alignSelf: 'center', marginBottom: Spacing.md }}
      />

      {/* Title */}
      <Skeleton width="80%" height={20} style={{ alignSelf: 'center', marginBottom: Spacing.sm }} />

      {/* Description */}
      <Skeleton width="100%" height={14} style={{ marginBottom: Spacing.xs }} />
      <Skeleton width="90%" height={14} style={{ marginBottom: Spacing.md }} />

      {/* Footer info */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width={80} height={16} />
        <Skeleton width={60} height={16} />
      </View>
    </View>
  );
};
