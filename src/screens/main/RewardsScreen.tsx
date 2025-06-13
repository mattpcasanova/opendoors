// src/screens/main/RewardsScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../components/main/BottomNavBar';
import RewardCard, { Reward } from '../../components/main/RewardCard';
import type { MainStackParamList } from '../../types/navigation';

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Mock data - in a real app this would come from your database
const mockRewards: Reward[] = [
  {
    id: '1',
    company: 'Target',
    reward: '$10 off $50 purchase',
    claimed: false,
    expirationDate: '2025-06-30',
    icon: '🎯',
    bgColor: 'bg-red-50',
    qrCode: 'TARGET_QR_123456',
    instructions: [
      'Show this QR code at checkout',
      'Minimum purchase of $50 required',
      'Cannot be combined with other offers',
      'Valid at all Target locations'
    ]
  },
  {
    id: '2',
    company: 'Chick-fil-A',
    reward: 'Free sandwich',
    claimed: true,
    expirationDate: '2025-07-15',
    icon: '🐔',
    bgColor: 'bg-orange-50',
    qrCode: 'CFA_QR_789012',
    instructions: [
      'Present QR code to cashier',
      'Valid for any sandwich on menu',
      'One per customer per visit',
      'Valid at participating locations'
    ]
  },
  {
    id: '3',
    company: 'Silver Shores Market',
    reward: 'Free fruit cup',
    claimed: false,
    expirationDate: '2025-06-16',
    icon: '🍓',
    bgColor: 'bg-green-50',
    qrCode: 'SSM_QR_345678',
    instructions: [
      'Show QR code at deli counter',
      'Choose any available fruit cup',
      'Valid during store hours',
      'Cannot be redeemed for cash'
    ]
  },
  {
    id: '4',
    company: 'Starbucks',
    reward: 'Free drink upgrade',
    claimed: false,
    expirationDate: '2025-07-01',
    icon: '☕',
    bgColor: 'bg-green-50',
    qrCode: 'SBUX_QR_901234',
    instructions: [
      'Present QR code when ordering',
      'Upgrade any size to venti',
      'Valid on all beverages',
      'Cannot upgrade food items'
    ]
  },
  {
    id: '5',
    company: "McDonald's",
    reward: 'Free medium fries',
    claimed: true,
    expirationDate: '2025-07-10',
    icon: '🍟',
    bgColor: 'bg-yellow-50',
    qrCode: 'MCD_QR_567890',
    instructions: [
      'Show QR code at counter or drive-thru',
      'Valid for medium fries only',
      'No purchase necessary',
      'Valid at participating locations'
    ]
  }
];

// Helper functions
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

interface RewardDetailProps {
  reward: Reward;
  onBack: () => void;
  onMarkClaimed: (rewardId: string) => void;
}

// QR Code Detail Screen Component
function RewardDetailScreen({ reward, onBack, onMarkClaimed }: RewardDetailProps) {
  const daysUntilExpiration = getDaysUntilExpiration(reward.expirationDate);
  const isExpiringSoon = daysUntilExpiration <= 3 && daysUntilExpiration >= 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <LinearGradient colors={['#009688', '#00796B']} style={{ paddingBottom: 20 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 20,
        }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 5 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              {reward.company}
            </Text>
          </View>
          <View style={{ width: 34 }} />
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
              {reward.company}
            </Text>
            <Text style={{ color: '#B2DFDB', fontSize: 16 }}>
              {reward.reward}
            </Text>
          </View>
          <Text style={{ fontSize: 40 }}>{reward.icon}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Status Badge */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            backgroundColor: reward.claimed ? '#DCFCE7' : '#DBEAFE',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}>
            <Text style={{
              color: reward.claimed ? '#166534' : '#1E40AF',
              fontSize: 14,
              fontWeight: '600'
            }}>
              {reward.claimed ? 'Already Claimed' : 'Ready to Claim'}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View style={{
            width: 192,
            height: 192,
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="qr-code" size={128} color="#9CA3AF" />
          </View>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            Reward Code
          </Text>
          <Text style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: '600',
            color: '#374151'
          }}>
            {reward.qrCode}
          </Text>
        </View>

        {/* Expiration Info */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <Ionicons name="calendar" size={20} color="#EA580C" style={{ marginRight: 12 }} />
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
              Expiration
            </Text>
            <Text style={{
              fontSize: 14,
              color: isExpiringSoon ? '#DC2626' : '#6B7280'
            }}>
              {formatExpirationText(reward.expirationDate)}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="location" size={20} color="#009688" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
              How to redeem
            </Text>
          </View>
          {reward.instructions.map((instruction: string, index: number) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: '#009688',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                marginTop: 2,
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  {index + 1}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 }}>
                {instruction}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={{
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
      }}>
        {!reward.claimed ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={() => onMarkClaimed(reward.id)}
            activeOpacity={0.8}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Mark as Claimed
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
          }}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '600' }}>
              Already claimed
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function RewardsScreen() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);

  // Calculate stats
  const stats = {
    totalRewards: rewards.length,
    activeClaimed: rewards.filter(r => r.claimed).length,
    expiringSoon: rewards.filter(r => {
      const days = getDaysUntilExpiration(r.expirationDate);
      return days <= 3 && days >= 0 && !r.claimed;
    }).length
  };

  const handleRewardPress = (reward: Reward) => {
    setSelectedReward(reward);
  };

  const handleMarkClaimed = (rewardId: string) => {
    setRewards((prev: Reward[]) => prev.map(r => 
      r.id === rewardId ? { ...r, claimed: true } : r
    ));
    setSelectedReward((prev: Reward | null) => 
      prev?.id === rewardId ? { ...prev, claimed: true } : prev
    );
    Alert.alert('Success', 'Reward marked as claimed!');
  };

  const handleBackFromDetail = () => {
    setSelectedReward(null);
  };

  // Show detail screen if a reward is selected
  if (selectedReward) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <RewardDetailScreen
          reward={selectedReward}
          onBack={handleBackFromDetail}
          onMarkClaimed={handleMarkClaimed}
        />
        <BottomNavBar initialTab="Rewards" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <LinearGradient colors={['#009688', '#00796B']} style={{ paddingBottom: 20 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 20,
        }}>
          <View>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 4 }}>
              Rewards
            </Text>
            <Text style={{ color: '#B2DFDB', fontSize: 16 }}>
              Your earned rewards
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 24,
          gap: 12,
        }}>
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#009688' }}>
              {stats.totalRewards}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
              Total{'\n'}Rewards
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#009688' }}>
              {stats.activeClaimed}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
              Already{'\n'}Claimed
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#EA580C' }}>
              {stats.expiringSoon}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
              Expiring{'\n'}Soon
            </Text>
          </View>
        </View>

        {/* Rewards List */}
        <View>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 16,
          }}>
            Available rewards
          </Text>
          
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onPress={handleRewardPress}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNavBar initialTab="Rewards" />
    </SafeAreaView>
  );
}