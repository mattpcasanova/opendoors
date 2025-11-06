import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CheckCircle, Clock, Gift } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../components/main/BottomNavBar';
import Header from '../../components/main/Header';
import RewardCard, { Reward } from '../../components/main/RewardCard';
import { useAuth } from '../../hooks/useAuth';
import { rewardsService } from '../../services/rewardsService';
import type { RootNavigationProp } from '../../types/navigation';

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

  // Map backend fields to frontend camelCase
  const qrCodeUrl = reward.qrCode || (reward as any).qr_code;
  const rewardCodeText = reward.rewardCode || (reward as any).reward_code;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <Header 
        variant="page" 
        title={reward.company} 
        subtitle={reward.reward}
        showBackButton
        onBackPress={onBack}
        rightComponent={
          reward.logo_url ? (
            <Image 
              source={{ uri: reward.logo_url }} 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'white' 
              }} 
            />
          ) : null
        }
      />

      <ScrollView 
        style={{ flex: 1, padding: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Status Badge */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            backgroundColor: reward.claimed ? '#DCFCE7' : '#DBEAFE',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: reward.claimed ? '#166534' : '#1E40AF'
            }}>
              {reward.claimed ? 'Already Claimed' : 'Ready to Claim'}
            </Text>
          </View>
        </View>

        {/* QR Code and Reward Code */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
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
            {/* Show QR code image if available, else placeholder */}
            {qrCodeUrl ? (
              <Image source={{ uri: qrCodeUrl }} style={{ width: 180, height: 180, resizeMode: 'contain' }} />
            ) : (
              <Ionicons name="qr-code" size={128} color="#9CA3AF" />
            )}
          </View>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            Reward Code
          </Text>
          <Text style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8
          }}>
            {rewardCodeText || 'N/A'}
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

        {/* Action Button */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 100,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
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
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
}

export default function RewardsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user]);

  // Refresh when the screen gains focus (but only if data is stale)
  useFocusEffect(
    useCallback(() => {
      if (user && rewards.length > 0) {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime;
        // Only refetch if more than 5 seconds have passed
        if (timeSinceLastFetch > 5000) {
          fetchRewards(true); // Background refresh
        }
      } else if (user && rewards.length === 0) {
        // If no data, fetch immediately
        fetchRewards();
      }
      return () => {};
    }, [user, lastFetchTime, rewards.length])
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('REFRESH_REWARDS', () => fetchRewards(true));
    return () => {
      subscription.remove();
    };
  }, []);

  const fetchRewards = async (backgroundRefresh: boolean = false) => {
    if (!user) return;
    try {
      // Only show loading spinner on initial load, not background refresh
      if (!backgroundRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const result = await rewardsService.getUserRewards(user.id);
      if (result.error) throw new Error(result.error);
      setRewards(result.data || []);
      setLastFetchTime(Date.now());
    } catch (error: any) {
      // Only show alert on initial load errors, silently fail on background refresh
      if (!backgroundRefresh) {
        Alert.alert('Error', error.message);
      } else {
        console.warn('Background refresh failed:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRewardPress = (reward: Reward) => {
    navigation.navigate('PrizeDetails', { reward });
  };

  const handleMarkClaimed = async (rewardId: string) => {
    try {
      const { success, error } = await rewardsService.claimRewardById(rewardId);
      if (success) {
        setRewards((prev: Reward[]) => prev.map(r => 
          r.id === rewardId ? { ...r, claimed: true } : r
        ));
        setSelectedReward((prev: Reward | null) => 
          prev?.id === rewardId ? { ...prev, claimed: true } : prev
        );
        Alert.alert('Success', 'Reward marked as claimed!');
      } else {
        Alert.alert('Error', error || 'Failed to mark reward as claimed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark reward as claimed. Please try again.');
    }
  };

  const handleBackFromDetail = () => {
    setSelectedReward(null);
  };

  // Show detail screen if a reward is selected
  if (selectedReward) {
    return (
      <RewardDetailScreen
        reward={selectedReward}
        onBack={handleBackFromDetail}
        onMarkClaimed={handleMarkClaimed}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#009688" />
      </SafeAreaView>
    );
  }

  // Calculate expiring soon count
  const getExpiringCount = () => {
    return rewards.filter(r => {
      const expiryDate = new Date(r.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry > 0 && !r.claimed;
    }).length;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Header variant="page" title="My Rewards" />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View style={{ padding: 16 }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search rewards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 16,
                color: '#374151',
              }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          marginBottom: 16,
          gap: 12,
        }}>
          {/* Active Rewards Card */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#E6FFFA',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Gift size={20} color="#009688" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
              {rewards.filter(r => !r.claimed).length}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Active</Text>
          </View>

          {/* Claimed Rewards Card */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#DCFCE7',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <CheckCircle size={20} color="#16A34A" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
              {rewards.filter(r => r.claimed).length}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Claimed</Text>
          </View>

          {/* Expiring Soon Card */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FEF3C7',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Clock size={20} color="#D97706" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
              {getExpiringCount()}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Expiring Soon</Text>
          </View>
        </View>

        {/* Rewards List */}
        <View style={{ paddingHorizontal: 16 }}>
          {rewards.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                No rewards found
              </Text>
            </View>
          ) : (
            rewards
              .filter(reward =>
                reward.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                reward.reward.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => {
                // Sort by creation date, newest first
                const dateA = new Date(a.created_at || a.expirationDate);
                const dateB = new Date(b.created_at || b.expirationDate);
                return dateB.getTime() - dateA.getTime();
              })
              .map(reward => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onPress={handleRewardPress}
                />
              ))
          )}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}