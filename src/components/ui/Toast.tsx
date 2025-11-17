import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  visible: boolean;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: 'checkmark-circle' as const,
        iconColor: Colors.success,
        backgroundColor: Colors.white,
        borderColor: Colors.success,
      };
    case 'error':
      return {
        icon: 'close-circle' as const,
        iconColor: Colors.error,
        backgroundColor: Colors.white,
        borderColor: Colors.error,
      };
    case 'warning':
      return {
        icon: 'warning' as const,
        iconColor: Colors.warning,
        backgroundColor: Colors.white,
        borderColor: Colors.warning,
      };
    case 'info':
      return {
        icon: 'information-circle' as const,
        iconColor: Colors.info,
        backgroundColor: Colors.white,
        borderColor: Colors.info,
      };
  }
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  visible,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = getToastConfig(type);

  useEffect(() => {
    if (visible) {
      // Slide in from top with smoother animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [visible, duration]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        left: Spacing.lg,
        right: Spacing.lg,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity
        onPress={dismissToast}
        activeOpacity={0.95}
        style={{
          backgroundColor: config.backgroundColor,
          borderRadius: BorderRadius.md,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          borderLeftWidth: 3,
          borderLeftColor: config.borderColor,
          ...Shadows.md,
          borderWidth: 1,
          borderColor: Colors.gray200,
          minHeight: 64,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: BorderRadius.full,
            backgroundColor: config.iconColor + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.md,
          }}
        >
          <Ionicons name={config.icon} size={22} color={config.iconColor} />
        </View>

        {/* Message */}
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: '600',
            color: Colors.gray900,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {message}
        </Text>

        {/* Dismiss icon */}
        <Ionicons
          name="close"
          size={20}
          color={Colors.gray400}
          style={{ marginLeft: Spacing.sm }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
