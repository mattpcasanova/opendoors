// src/components/RewardCard.tsx
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
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={() => onPress(reward)}
      activeOpacity={0.8}
    >
      {/* Icon */}
      <View style={{
        width: 48,
        height: 48,
        backgroundColor: getBackgroundColor(reward.bgColor),
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Text style={{ fontSize: 24 }}>{reward.icon}</Text>
      </View>
      
      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 4 
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#333',
            marginRight: 8
          }}>
            {reward.company}
          </Text>
          {reward.claimed && (
            <View style={{
              backgroundColor: '#DCFCE7',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
            }}>
              <Text style={{
                fontSize: 10,
                color: '#166534',
                fontWeight: '600'
              }}>
                Claimed
              </Text>
            </View>
          )}
        </View>
        
        <Text style={{ 
          fontSize: 14, 
          color: '#666',
          marginBottom: 4,
        }}>
          {reward.reward}
        </Text>
        
        <Text style={{ 
          fontSize: 12, 
          color: getExpirationColor(),
          fontWeight: '500'
        }}>
          {formatExpirationText(reward.expirationDate)}
        </Text>
      </View>
      
      {/* Right side indicators */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center' 
      }}>
        {isExpiringSoon && !reward.claimed && (
          <View style={{
            width: 8,
            height: 8,
            backgroundColor: '#EA580C',
            borderRadius: 4,
            marginRight: 8
          }} />
        )}
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#9CA3AF" 
        />
      </View>
    </TouchableOpacity>
  );
}