// src/components/RewardCard.tsx
import { Calendar, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows, TextStyles } from '../../constants';
import { TouchableScale } from '../ui';

export interface Reward {
  id: string;
  company: string;
  reward: string;
  claimed: boolean;
  expirationDate: string;
  icon: string;
  bgColor: string;
  qrCode: string;
  rewardCode: string;
  instructions: string[];
  logo_url?: string;
  created_at?: string;
}

interface Props {
  reward: Reward;
  onPress: (reward: Reward) => void;
}

// Helper function to calculate days until expiration
const getDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatExpirationText = (expirationDate: string): string => {
  const days = getDaysUntilExpiration(expirationDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires ${new Date(expirationDate).toLocaleDateString()}`;
};

const getBackgroundColor = (bgColor: string): string => {
  const colorMap: { [key: string]: string } = {
    'bg-red-50': '#FEF2F2',
    'bg-orange-50': '#FFF7ED', 
    'bg-green-50': '#F0FDF4',
    'bg-yellow-50': '#FEFCE8',
    'bg-blue-50': '#EFF6FF',
    'bg-purple-50': '#FAF5FF',
    'bg-pink-50': '#FDF2F8',
    'bg-brown-50': '#F5F5F5',
  };
  return colorMap[bgColor] || '#F9FAFB';
};

export default function RewardCard({ reward, onPress }: Props) {
  const daysUntilExpiration = getDaysUntilExpiration(reward.expirationDate);
  const isExpiringSoon = daysUntilExpiration <= 3 && daysUntilExpiration >= 0;
  const isExpired = daysUntilExpiration < 0;
  const isClaimed = reward.claimed;

  // Shimmer animation for active rewards
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for expiring soon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Shimmer effect for active, unclaimed rewards (subtle)
    if (!isClaimed && !isExpired) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [isClaimed, isExpired, shimmerAnim]);

  useEffect(() => {
    // Pulse animation for expiring soon
    if (isExpiringSoon && !isClaimed) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isExpiringSoon, isClaimed, pulseAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  // Get gradient colors based on state
  const getGradientColors = (): string[] => {
    if (isExpired) {
      return [Colors.gray100, Colors.gray50]; // Grayed out
    }
    if (isClaimed) {
      return [Colors.successLight, Colors.success]; // Green gradient
    }
    if (isExpiringSoon) {
      return [Colors.warningLight, Colors.warning]; // Orange gradient
    }
    return [Colors.primaryLight, Colors.primary]; // Default teal gradient
  };

  const getStatusIcon = () => {
    if (isExpired) {
      return <XCircle size={20} color={Colors.error} strokeWidth={2.5} />;
    }
    if (isClaimed) {
      return <CheckCircle size={20} color={Colors.success} strokeWidth={2.5} />;
    }
    if (isExpiringSoon) {
      return <Clock size={20} color={Colors.warning} strokeWidth={2.5} />;
    }
    return <Calendar size={18} color={Colors.gray500} strokeWidth={2} />;
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <View style={{
          backgroundColor: Colors.error,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          borderRadius: BorderRadius.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}>
          <XCircle size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>EXPIRED</Text>
        </View>
      );
    }
    if (isClaimed) {
      return (
        <View style={{
          backgroundColor: Colors.success,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          borderRadius: BorderRadius.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}>
          <CheckCircle size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>CLAIMED</Text>
        </View>
      );
    }
    if (isExpiringSoon) {
      return (
        <Animated.View style={{
          backgroundColor: Colors.warning,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          borderRadius: BorderRadius.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          transform: [{ scale: pulseAnim }],
        }}>
          <Clock size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>
            {daysUntilExpiration === 0 ? 'TODAY' : `${daysUntilExpiration}D LEFT`}
          </Text>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <TouchableScale
      onPress={() => onPress(reward)}
      scaleValue={0.97}
      hapticFeedback={!isExpired}
      style={{
        marginBottom: Spacing.md,
        overflow: 'hidden',
        borderRadius: BorderRadius.lg,
      }}
    >
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
        opacity: isExpired ? 0.6 : 1,
        borderWidth: 1,
        borderColor: Colors.gray200,
      }}>
        {/* Gradient top bar */}
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: 6,
            width: '100%',
          }}
        />

        {/* Subtle shimmer overlay for active rewards */}
        {!isClaimed && !isExpired && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: [{ translateX: shimmerTranslate }],
              opacity: 0.15,
            }}
            pointerEvents="none"
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 150, height: '100%' }}
            />
          </Animated.View>
        )}

        {/* Card content */}
        <View style={{
          padding: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {/* Logo with glow */}
          <View style={{
            width: 72,
            height: 72,
            borderRadius: BorderRadius.md,
            overflow: 'hidden',
            backgroundColor: Colors.white,
            marginRight: Spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderWidth: 1,
            borderColor: Colors.gray200,
            ...(!isExpired && !isClaimed && Shadows.primarySm),
          }}>
            {reward.logo_url ? (
              <Image
                source={{ uri: reward.logo_url }}
                style={{ width: 72, height: 72, resizeMode: 'cover' }}
              />
            ) : (
              <Text style={{ fontSize: 36 }}>{reward.icon}</Text>
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Company name and badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '700',
                  color: Colors.black,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {reward.company}
              </Text>
              {getStatusBadge()}
            </View>

            {/* Reward description */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: Colors.gray800,
                marginBottom: Spacing.sm,
                lineHeight: 19,
              }}
              numberOfLines={2}
            >
              {reward.reward}
            </Text>

            {/* Expiration info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {getStatusIcon()}
              <Text style={{
                fontSize: 13,
                color: isExpired ? Colors.error : (isClaimed ? Colors.success : (isExpiringSoon ? Colors.warningDark : Colors.black)),
                fontWeight: '600',
              }}>
                {isClaimed ? 'Claimed' : formatExpirationText(reward.expirationDate)}
              </Text>
            </View>
          </View>

          {/* Chevron */}
          <ChevronRight
            size={22}
            color={isExpired ? Colors.gray400 : Colors.gray500}
            style={{ marginLeft: Spacing.sm }}
          />
        </View>
      </View>
    </TouchableScale>
  );
}