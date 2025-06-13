import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface Reward {
  id: string;
  company: string;
  reward: string;
  claimed: boolean;
  expirationDate: string;
  icon: string;
  bgColor: string;
  qrCode: string;
  instructions: string[];
}

interface Props {
  reward: Reward;
  onPress: (reward: Reward) => void;
}

export default function RewardCard({ reward, onPress }: Props) {
  const daysUntilExpiration = getDaysUntilExpiration(reward.expirationDate);
  const isExpiringSoon = daysUntilExpiration <= 3 && daysUntilExpiration >= 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(reward)}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Text style={{ fontSize: 24 }}>{reward.icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
          {reward.company}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
          {reward.reward}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="calendar"
            size={14}
            color={isExpiringSoon ? '#DC2626' : '#6B7280'}
            style={{ marginRight: 4 }}
          />
          <Text style={{
            fontSize: 12,
            color: isExpiringSoon ? '#DC2626' : '#6B7280'
          }}>
            {formatExpirationText(reward.expirationDate)}
          </Text>
        </View>
      </View>

      <View style={{
        backgroundColor: reward.claimed ? '#DCFCE7' : '#DBEAFE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
      }}>
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: reward.claimed ? '#166534' : '#1E40AF'
        }}>
          {reward.claimed ? 'Claimed' : 'Available'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Helper functions
function getDaysUntilExpiration(expirationDate: string): number {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatExpirationText(expirationDate: string): string {
  const days = getDaysUntilExpiration(expirationDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires ${new Date(expirationDate).toLocaleDateString()}`;
} 