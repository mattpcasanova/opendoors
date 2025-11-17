import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { TouchableScale } from './TouchableScale';

export type EmptyStateVariant = 'no-rewards' | 'no-games' | 'no-history' | 'no-results' | 'error';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const getVariantConfig = (variant: EmptyStateVariant) => {
  switch (variant) {
    case 'no-rewards':
      return {
        icon: 'gift-outline' as const,
        iconColor: Colors.warning,
        iconBgColor: '#FEF3C7',
        defaultTitle: 'No Rewards Yet',
        defaultMessage: 'Play games to earn prizes and rewards!',
      };
    case 'no-games':
      return {
        icon: 'game-controller-outline' as const,
        iconColor: Colors.primary,
        iconBgColor: Colors.primaryLight,
        defaultTitle: 'No Games Available',
        defaultMessage: 'Check back soon for new games nearby!',
      };
    case 'no-history':
      return {
        icon: 'time-outline' as const,
        iconColor: Colors.gray600,
        iconBgColor: Colors.gray100,
        defaultTitle: 'No Games Played Yet',
        defaultMessage: 'Your game history will appear here after you play your first game.',
      };
    case 'no-results':
      return {
        icon: 'search-outline' as const,
        iconColor: Colors.info,
        iconBgColor: Colors.infoLight + '20',
        defaultTitle: 'No Results Found',
        defaultMessage: 'Try adjusting your filters or search query.',
      };
    case 'error':
      return {
        icon: 'alert-circle-outline' as const,
        iconColor: Colors.error,
        iconBgColor: Colors.errorLight + '20',
        defaultTitle: 'Something Went Wrong',
        defaultMessage: 'We couldn\'t load this content. Please try again.',
      };
  }
};

export function EmptyState({
  variant,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const config = getVariantConfig(variant);

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: Spacing.xl * 2,
          paddingHorizontal: Spacing.xl,
        },
        style,
      ]}
    >
      {/* Icon Circle */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: BorderRadius.full,
          backgroundColor: config.iconBgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.lg,
        }}
      >
        <Ionicons name={config.icon} size={48} color={config.iconColor} />
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: Colors.gray900,
          textAlign: 'center',
          marginBottom: Spacing.sm,
        }}
      >
        {title || config.defaultTitle}
      </Text>

      {/* Message */}
      <Text
        style={{
          fontSize: 15,
          color: Colors.gray600,
          textAlign: 'center',
          lineHeight: 22,
          maxWidth: 280,
          marginBottom: actionLabel && onAction ? Spacing.lg : 0,
        }}
      >
        {message || config.defaultMessage}
      </Text>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <TouchableScale
          onPress={onAction}
          style={{
            backgroundColor: Colors.primary,
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.full,
            marginTop: Spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: Colors.white,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableScale>
      )}
    </View>
  );
}
