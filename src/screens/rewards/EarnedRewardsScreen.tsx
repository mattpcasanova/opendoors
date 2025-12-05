import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    DeviceEventEmitter,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import EarnRewardModal from '../../components/modals/EarnRewardModal';
import WatchAdModal from '../../components/modals/WatchAdModal';
import { LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { EarnedReward, earnedRewardsService } from '../../services/earnedRewardsService';
import { adsService } from '../../services/adsService';
import { Colors, Shadows } from '../../constants';

const EarnedRewardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([]);
  const [showEarnModal, setShowEarnModal] = useState(false);
  const [showWatchAdModal, setShowWatchAdModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  // Load earned rewards from database
  const loadEarnedRewards = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await earnedRewardsService.getUserEarnedRewards(user.id);
      if (error) {
        console.error('Error loading earned rewards:', error);
        return;
      }
      setEarnedRewards(data || []);
    } catch (error) {
      console.error('Error in loadEarnedRewards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load rewards when component mounts
  useEffect(() => {
    loadEarnedRewards();
  }, [user?.id]);

  const handleEarnReward = () => {
    setShowEarnModal(true);
  };

  const handleWatchAd = async () => {
    // Prevent multiple simultaneous ad loads
    if (isLoadingAd) {
      console.log('[ads] Already loading an ad, ignoring click');
      return;
    }

    setShowEarnModal(false);
    setIsLoadingAd(true);

    try {
      await adsService.init();
      const result = await adsService.showRewardedAd();

      if (result.userEarnedReward && user?.id) {
        const { error } = await earnedRewardsService.addAdWatchReward(user.id);
        if (error) {
          console.error('Error adding ad reward:', error);
          Alert.alert('Error', 'Failed to add reward. Please try again.');
          setIsLoadingAd(false);
          return;
        }

        await loadEarnedRewards();
        DeviceEventEmitter.emit('REFRESH_EARNED_DOORS');
        setIsLoadingAd(false);
        return;
      }

      setIsLoadingAd(false);
      Alert.alert('No reward granted', 'The ad did not grant a reward this time. Please try again.');
    } catch (e) {
      console.warn('[ads] Falling back, ad failed:', e);
      setIsLoadingAd(false);
      Alert.alert('Ad unavailable', 'The ad failed to load. Please try again shortly.');
    }
  };

  const handleReferFriend = async () => {
    setShowEarnModal(false);
    // Refer friend functionality is handled in the modal
    // Reload rewards to show the new one that was added by the modal
    await loadEarnedRewards();
    
    // Notify HomeScreen to refresh its earned doors count
    DeviceEventEmitter.emit('REFRESH_EARNED_DOORS');
  };

  const handleAdComplete = async () => {
    setShowWatchAdModal(false);
    
    // Reload rewards to show the new one that was added by the modal
    await loadEarnedRewards();
    
    // Notify HomeScreen to refresh its earned doors count
    DeviceEventEmitter.emit('REFRESH_EARNED_DOORS');
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'book';
      case 'ad':
        return 'tv';
      case 'referral':
        return 'people';
      case 'achievement':
        return 'trophy';
      default:
        return 'gift';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return '#3B82F6'; // Blue
      case 'ad':
        return '#10B981'; // Green
      case 'referral':
        return '#8B5CF6'; // Purple
      case 'achievement':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  const RewardCard: React.FC<{ reward: EarnedReward }> = ({ reward }) => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getRewardIcon(reward.source_type) as any} 
            size={32} 
            color="#10B981" 
          />
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle}>From: {reward.source_name}</Text>
          <Text style={styles.rewardReason}>{reward.description}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.rewardDate}>
            {new Date(reward.created_at).toLocaleDateString()}
          </Text>
          {reward.claimed && (
            <Text style={styles.claimedText}>Claimed</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earned Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Earn a Reward Button */}
        <TouchableOpacity 
          style={styles.earnButton}
          onPress={handleEarnReward}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#14B8A6", "#10B981"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.earnButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.earnButtonText}>Earn a Reward</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Rewards List */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Your Rewards</Text>
          
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="refresh" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Loading rewards...</Text>
            </View>
          ) : earnedRewards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No rewards yet</Text>
              <Text style={styles.emptyDescription}>
                Complete lessons, watch ads, or refer friends to earn extra doors!
              </Text>
            </View>
          ) : (
            earnedRewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <EarnRewardModal
        visible={showEarnModal}
        onClose={() => setShowEarnModal(false)}
        onWatchAd={handleWatchAd}
        onReferFriend={handleReferFriend}
      />

      <WatchAdModal
        visible={showWatchAdModal}
        onClose={() => setShowWatchAdModal(false)}
        onAdComplete={handleAdComplete}
      />

      {/* Ad Loading Overlay */}
      {isLoadingAd && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            paddingVertical: 40,
            paddingHorizontal: 32,
            borderRadius: 24,
            alignItems: 'center',
            minWidth: 200,
            ...Shadows.lg,
          }}>
            <LoadingSpinner size="large" color={Colors.primary} />
            <Text style={{
              marginTop: 20,
              fontSize: 18,
              fontWeight: '700',
              color: Colors.gray900,
            }}>
              Loading Ad
            </Text>
            <Text style={{
              marginTop: 8,
              fontSize: 14,
              color: Colors.gray600,
              textAlign: 'center',
              lineHeight: 20,
            }}>
              Please wait while we prepare{'\n'}your reward
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  earnButton: {
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#14B8A6',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  earnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  earnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rewardsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
    flexShrink: 0,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  rewardReason: {
    fontSize: 14,
    color: '#374151',
    flexWrap: 'wrap',
  },
  dateContainer: {
    alignItems: 'flex-end',
    minWidth: 70,
    flexShrink: 0,
  },
  rewardDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  claimedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EarnedRewardsScreen;
