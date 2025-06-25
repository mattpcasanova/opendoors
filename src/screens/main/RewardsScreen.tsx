import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../components/main/BottomNavBar';
import RewardCard, { Reward } from '../../components/main/RewardCard';
import { useAuth } from '../../hooks/useAuth';
import { rewardsService } from '../../services/rewardsService';
import type { MainStackParamList } from '../../types/navigation';

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

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
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            {/* No company name here, only in the row below with logo */}
          </View>
          <View style={{ width: 34 }} />
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          {/* Logo on the left */}
          {reward.logo_url ? (
            <Image source={{ uri: reward.logo_url }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: 'white' }} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
              {reward.company}
            </Text>
            <Text style={{ color: '#B2DFDB', fontSize: 16 }}>
              {reward.reward}
            </Text>
          </View>
        </View>
      </LinearGradient>

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
      <BottomNavBar initialTab="Rewards" />
    </SafeAreaView>
  );
}

export default function RewardsScreen() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);

  useEffect(() => {
    fetchRewards();
  }, [user]);

  // Filter rewards based on search text
  useEffect(() => {
    if (!rewards) return;
    
    const filtered = rewards.filter(reward => {
      const searchLower = searchText.toLowerCase();
      const companyMatch = reward.company.toLowerCase().includes(searchLower);
      const rewardMatch = reward.reward.toLowerCase().includes(searchLower);
      
      return companyMatch || rewardMatch;
    });
    
    setFilteredRewards(filtered);
  }, [searchText, rewards]);

  const fetchRewards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await rewardsService.getUserRewards(user.id);
      if (error) {
        console.error('Error fetching rewards:', error);
        Alert.alert('Error', 'Failed to load rewards. Please try again.');
        return;
      }
      
      if (data) {
        console.log('Loaded rewards:', data);
        setRewards(data);
      }
    } catch (err) {
      console.error('Error in fetchRewards:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
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

        {/* Search Bar */}
        <View style={{ marginBottom: 24 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Ionicons name="search" size={20} color="#999999" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: '#333',
              }}
              placeholder="Search rewards by company or reward"
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Info */}
        {searchText.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>
              Found {filteredRewards.length} reward{filteredRewards.length !== 1 ? 's' : ''} matching "{searchText}"
            </Text>
          </View>
        )}

        {/* Rewards List */}
        <View>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 16,
          }}>
            {searchText ? 'Search Results' : 'Your rewards'}
          </Text>
          
          {loading ? (
            <Text style={{ textAlign: 'center', color: '#6B7280' }}>Loading rewards...</Text>
          ) : (searchText ? filteredRewards : rewards).length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#6B7280' }}>
              {searchText ? 'No rewards found matching your search.' : 'No rewards yet. Play games to win prizes!'}
            </Text>
          ) : (
            (searchText ? filteredRewards : rewards).map((reward) => (
              <RewardCard
                key={reward.id + (reward.created_at || '')}
                reward={reward}
                onPress={() => handleRewardPress(reward)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <BottomNavBar initialTab="Rewards" />
    </SafeAreaView>
  );
}