import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/main/Header';
import { LoadingSpinner } from '../../components/ui';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { EarnedReward, earnedRewardsService } from '../../services/earnedRewardsService';

interface RewardVisual {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const getRewardVisual = (type: string): RewardVisual => {
  switch (type) {
    case 'teacher':
      return { icon: 'school', color: Colors.primary, bg: Colors.primaryMuted };
    case 'distributor':
      return { icon: 'gift', color: Colors.primary, bg: Colors.primaryMuted };
    case 'achievement':
      return { icon: 'trophy', color: Colors.secondaryDark, bg: 'rgba(255, 152, 0, 0.12)' };
    case 'lesson':
      return { icon: 'book', color: Colors.info, bg: 'rgba(59, 130, 246, 0.12)' };
    case 'survey':
      return { icon: 'clipboard', color: Colors.successDark, bg: 'rgba(16, 185, 129, 0.12)' };
    case 'referral':
      return { icon: 'people', color: Colors.info, bg: 'rgba(59, 130, 246, 0.12)' };
    default:
      return { icon: 'gift', color: Colors.gray500, bg: Colors.gray100 };
  }
};

const EarnedRewardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedRewardsCount, setDisplayedRewardsCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

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

  useEffect(() => {
    loadEarnedRewards();
  }, [user?.id]);

  const loadMoreRewards = () => {
    if (loadingMore || displayedRewardsCount >= earnedRewards.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedRewardsCount(prev => Math.min(prev + 10, earnedRewards.length));
      setLoadingMore(false);
    }, 300);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 200;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreRewards();
    }
  };

  const availableCount = earnedRewards.filter(r => !r.claimed).length;
  const playedCount = earnedRewards.filter(r => r.claimed).length;

  const RewardCard: React.FC<{ reward: EarnedReward }> = ({ reward }) => {
    const visual = getRewardVisual(reward.source_type);
    const isTeacher = reward.source_type === 'teacher';
    return (
      <View style={[styles.rewardCard, { borderLeftColor: visual.color }]}>
        <View style={styles.rewardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: visual.bg, borderColor: visual.color + '33' }]}>
            <Ionicons name={visual.icon} size={28} color={visual.color} />
          </View>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>
              {isTeacher ? `From ${reward.source_name}` : reward.source_name}
            </Text>
            <Text style={styles.rewardReason}>{reward.description}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.rewardDate}>
              {new Date(reward.created_at).toLocaleDateString()}
            </Text>
            {reward.claimed && <Text style={styles.claimedText}>Played</Text>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        variant="section"
        iconName="school"
        title="Earned Doors"
        subtitle={`${availableCount} ${availableCount === 1 ? 'door' : 'doors'} ready to play · from your teachers`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Summary chips */}
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipNumber}>{availableCount}</Text>
          <Text style={styles.chipLabel}>Available</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipNumber}>{playedCount}</Text>
          <Text style={styles.chipLabel}>Played</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Your Doors</Text>

          {loading ? (
            <View style={styles.emptyState}>
              <LoadingSpinner size="small" color={Colors.primary} />
              <Text style={styles.emptyTitle}>Loading…</Text>
            </View>
          ) : earnedRewards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={48} color={Colors.gray400} />
              <Text style={styles.emptyTitle}>No doors yet</Text>
              <Text style={styles.emptyDescription}>
                When your teacher sends you doors, they'll show up here. Check back after class!
              </Text>
            </View>
          ) : (
            <>
              {earnedRewards.slice(0, displayedRewardsCount).map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              ))}

              {loadingMore && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <LoadingSpinner size="small" color={Colors.primary} />
                  <Text style={{ color: Colors.gray600, marginTop: 8, fontSize: 14 }}>
                    Loading more...
                  </Text>
                </View>
              )}

              {displayedRewardsCount < earnedRewards.length && !loadingMore && (
                <Text style={styles.countText}>
                  Showing {displayedRewardsCount} of {earnedRewards.length}
                </Text>
              )}

              {displayedRewardsCount >= earnedRewards.length && earnedRewards.length > 10 && (
                <Text style={styles.countText}>All {earnedRewards.length} loaded</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCount: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -16,
  },
  chip: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  chipLabel: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  rewardsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 16,
  },
  rewardCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: Colors.black,
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
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  rewardReason: {
    fontSize: 14,
    color: Colors.gray700,
    flexWrap: 'wrap',
  },
  dateContainer: {
    alignItems: 'flex-end',
    minWidth: 64,
    flexShrink: 0,
  },
  rewardDate: {
    fontSize: 12,
    color: Colors.gray400,
    textAlign: 'right',
  },
  claimedText: {
    fontSize: 11,
    color: Colors.primary,
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
    color: Colors.gray600,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  countText: {
    color: Colors.gray600,
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
});

export default EarnedRewardsScreen;
