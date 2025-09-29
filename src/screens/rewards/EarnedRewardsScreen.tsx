import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    DeviceEventEmitter,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import EarnRewardModal from '../../components/modals/EarnRewardModal';
import WatchAdModal from '../../components/modals/WatchAdModal';
import { useAuth } from '../../hooks/useAuth';
import { EarnedReward, earnedRewardsService } from '../../services/earnedRewardsService';

const EarnedRewardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([]);
  const [showEarnModal, setShowEarnModal] = useState(false);
  const [showWatchAdModal, setShowWatchAdModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleWatchAd = () => {
    setShowEarnModal(false);
    setShowWatchAdModal(true);
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
        <View style={[styles.iconContainer, { backgroundColor: getRewardColor(reward.source_type) + '20' }]}>
          <Ionicons 
            name={getRewardIcon(reward.source_type) as any} 
            size={24} 
            color={getRewardColor(reward.source_type)} 
          />
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle}>
            +{reward.doors_earned} Door{reward.doors_earned > 1 ? 's' : ''}
          </Text>
          <Text style={styles.rewardFrom}>From: {reward.source_name}</Text>
          <Text style={styles.rewardReason}>{reward.description}</Text>
        </View>
        <View style={styles.doorCount}>
          <Text style={styles.doorCountText}>+{reward.doors_earned}</Text>
        </View>
      </View>
      <Text style={styles.rewardDate}>
        {new Date(reward.created_at).toLocaleDateString()}
        {reward.claimed && ' • Claimed'}
      </Text>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  rewardFrom: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  rewardReason: {
    fontSize: 14,
    color: '#374151',
  },
  doorCount: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doorCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  rewardDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
