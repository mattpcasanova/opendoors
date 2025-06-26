// src/components/RewardCard.tsx
import { Calendar, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

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

  const getExpirationColor = () => {
    if (isExpired) return '#DC2626'; // red-600
    if (isExpiringSoon) return '#EA580C'; // orange-600
    return '#6B7280'; // gray-500
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
      onPress={() => onPress(reward)}
      activeOpacity={0.85}
    >
      {/* Logo */}
      <View style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        marginRight: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {reward.logo_url ? (
          <Image
            source={{ uri: reward.logo_url }}
            style={{ width: 64, height: 64, resizeMode: 'cover' }}
          />
        ) : (
          <Text style={{ fontSize: 32 }}>{reward.icon}</Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#111827', flexShrink: 1 }} numberOfLines={1}>
            {reward.company}
          </Text>
          {reward.claimed && (
            <View style={{ backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
              <Text style={{ color: '#16A34A', fontSize: 12, fontWeight: 'bold' }}>Claimed</Text>
            </View>
          )}
        </View>
        <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }} numberOfLines={2}>
          {reward.reward}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Calendar size={16} color="#9CA3AF" />
          <Text style={{ fontSize: 13, color: isExpiringSoon ? '#DC2626' : '#6B7280', fontWeight: isExpiringSoon ? '600' : '400', marginLeft: 4 }}>
            {formatExpirationText(reward.expirationDate)}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={20} color="#9CA3AF" style={{ marginLeft: 12 }} />
    </TouchableOpacity>
  );
}