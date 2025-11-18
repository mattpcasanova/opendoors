import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CheckCircle, Clock, Gift } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
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
import { LoadingSpinner, TouchableScale, EmptyState } from '../../components/ui';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
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
                backgroundColor: Colors.white
              }}
            />
          ) : null
        }
      />

      <ScrollView
        style={{ flex: 1, padding: Spacing.lg }}
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
      >
        {/* Status Badge */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            backgroundColor: reward.claimed ? Colors.successLight : Colors.infoLight,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: reward.claimed ? Colors.successDark : Colors.infoDark
            }}>
              {reward.claimed ? 'Already Claimed' : 'Ready to Claim'}
            </Text>
          </View>
        </View>

        {/* QR Code and Reward Code */}
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View style={{
            width: 192,
            height: 192,
            backgroundColor: Colors.gray100,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            {/* Show QR code image if available, else placeholder */}
            {qrCodeUrl ? (
              <Image source={{ uri: qrCodeUrl }} style={{ width: 180, height: 180, resizeMode: 'contain' }} />
            ) : (
              <Ionicons name="qr-code" size={128} color={Colors.gray400} />
            )}
          </View>
          <Text style={{ fontSize: 12, color: Colors.gray600, marginBottom: 8 }}>
            Reward Code
          </Text>
          <Text style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: '600',
            color: Colors.gray700,
            marginBottom: 8
          }}>
            {rewardCodeText || 'N/A'}
          </Text>
        </View>

        {/* Expiration Info */}
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <Ionicons name="calendar" size={20} color={Colors.warning} style={{ marginRight: 12 }} />
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.gray700, marginBottom: 4 }}>
              Expiration
            </Text>
            <Text style={{
              fontSize: 14,
              color: isExpiringSoon ? Colors.error : Colors.gray600
            }}>
              {formatExpirationText(reward.expirationDate)}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="location" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.gray700 }}>
              How to redeem
            </Text>
          </View>
          {reward.instructions.map((instruction: string, index: number) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: Colors.primary,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                marginTop: 2,
              }}>
                <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '600' }}>
                  {index + 1}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: Colors.gray700, lineHeight: 20 }}>
                {instruction}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: 12,
          padding: 20,
          marginBottom: 100,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          {!reward.claimed ? (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: Spacing.md,
                borderRadius: BorderRadius.md,
                alignItems: 'center',
              }}
              onPress={() => onMarkClaimed(reward.id)}
              activeOpacity={0.8}
            >
              <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '600' }}>
                Mark as Claimed
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: Spacing.md,
            }}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={{ marginRight: Spacing.sm }} />
              <Text style={{ color: Colors.success, fontSize: 16, fontWeight: '600' }}>
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
  const { showToast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'claimed' | 'expiring'>('all');

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
        showToast('Reward claimed successfully!', 'success');
        setSelectedReward(null); // Close the modal
      } else {
        showToast(error || 'Failed to claim reward', 'error');
      }
    } catch (error) {
      showToast('Failed to claim reward. Please try again.', 'error');
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  // Calculate active count (unclaimed and not expired)
  const getActiveCount = () => {
    return rewards.filter(r => {
      if (r.claimed) return false;
      const daysUntil = getDaysUntilExpiration(r.expirationDate);
      return daysUntil >= 0; // Not expired
    }).length;
  };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <Header variant="page" title="My Rewards" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View style={{ padding: Spacing.md }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.md,
            padding: Spacing.base,
            alignItems: 'center',
            ...Shadows.sm,
          }}>
            <Ionicons name="search" size={20} color={Colors.gray500} style={{ marginRight: Spacing.sm }} />
            <TextInput
              placeholder="Search rewards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 16,
                color: Colors.gray800,
              }}
              placeholderTextColor={Colors.gray400}
            />
          </View>
        </View>

        {/* Stats Cards - Clickable Filters */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
          marginBottom: Spacing.md,
          gap: Spacing.base,
        }}>
          {/* Active Rewards Card */}
          <TouchableScale
            onPress={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            style={{ flex: 1 }}
          >
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              ...Shadows.sm,
              borderWidth: 2,
              borderColor: statusFilter === 'active' ? Colors.primary : 'transparent',
              minHeight: 110,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.base,
              }}>
                <Gift size={20} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: 4 }}>
                {getActiveCount()}
              </Text>
              <Text style={{ fontSize: 14, color: Colors.gray600 }}>Active</Text>
            </View>
          </TouchableScale>

          {/* Claimed Rewards Card */}
          <TouchableScale
            onPress={() => setStatusFilter(statusFilter === 'claimed' ? 'all' : 'claimed')}
            style={{ flex: 1 }}
          >
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              ...Shadows.sm,
              borderWidth: 2,
              borderColor: statusFilter === 'claimed' ? Colors.success : 'transparent',
              minHeight: 110,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.base,
              }}>
                <CheckCircle size={20} color={Colors.success} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: 4 }}>
                {rewards.filter(r => r.claimed).length}
              </Text>
              <Text style={{ fontSize: 14, color: Colors.gray600 }}>Claimed</Text>
            </View>
          </TouchableScale>

          {/* Expiring Soon Card */}
          <TouchableScale
            onPress={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
            style={{ flex: 1 }}
          >
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              ...Shadows.sm,
              borderWidth: 2,
              borderColor: statusFilter === 'expiring' ? Colors.warning : 'transparent',
              minHeight: 110,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.base,
              }}>
                <Clock size={20} color={Colors.warning} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: 4 }}>
                {getExpiringCount()}
              </Text>
              <Text style={{ fontSize: 14, color: Colors.gray600, numberOfLines: 1 }}>Expiring</Text>
            </View>
          </TouchableScale>
        </View>

        {/* Rewards List */}
        <View style={{ paddingHorizontal: Spacing.md }}>
          {rewards.length === 0 ? (
            <EmptyState
              variant="no-rewards"
              actionLabel="Browse Games"
              onAction={() => navigation.navigate('Home')}
            />
          ) : (
            rewards
              .filter(reward => {
                // Search filter
                const matchesSearch = reward.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  reward.reward.toLowerCase().includes(searchQuery.toLowerCase());

                // Status filter
                if (statusFilter === 'active') {
                  // Active = unclaimed AND not expired
                  const daysUntil = getDaysUntilExpiration(reward.expirationDate);
                  return matchesSearch && !reward.claimed && daysUntil >= 0;
                } else if (statusFilter === 'claimed') {
                  return matchesSearch && reward.claimed;
                } else if (statusFilter === 'expiring') {
                  const daysUntil = getDaysUntilExpiration(reward.expirationDate);
                  return matchesSearch && daysUntil <= 3 && daysUntil >= 0 && !reward.claimed;
                }
                return matchesSearch; // 'all' filter
              })
              .sort((a, b) => {
                // Priority-based sorting: expiring soon > active > claimed > expired
                const daysA = getDaysUntilExpiration(a.expirationDate);
                const daysB = getDaysUntilExpiration(b.expirationDate);

                const isExpiredA = daysA < 0;
                const isExpiredB = daysB < 0;
                const isExpiringSoonA = daysA <= 3 && daysA >= 0 && !a.claimed;
                const isExpiringSoonB = daysB <= 3 && daysB >= 0 && !b.claimed;
                const isClaimedA = a.claimed;
                const isClaimedB = b.claimed;

                // 1. Expired items go to bottom
                if (isExpiredA && !isExpiredB) return 1;
                if (!isExpiredA && isExpiredB) return -1;

                // 2. Expiring soon goes to top (among non-expired)
                if (isExpiringSoonA && !isExpiringSoonB) return -1;
                if (!isExpiringSoonA && isExpiringSoonB) return 1;

                // 3. Claimed goes after active
                if (isClaimedA && !isClaimedB && !isExpiredB) return 1;
                if (!isClaimedA && isClaimedB && !isExpiredA) return -1;

                // 4. Within same priority, sort by expiration date (soonest first)
                if (!isExpiredA && !isExpiredB) {
                  return daysA - daysB;
                }

                // 5. For expired items, sort by expiration date (most recently expired first)
                const dateA = new Date(a.expirationDate);
                const dateB = new Date(b.expirationDate);
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