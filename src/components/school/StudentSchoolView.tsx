import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import {
  ClassWithTeacher,
  GrantedReward,
  schoolService,
} from '../../services/schoolService';
import { supabase } from '../../services/supabase/client';
import GameScreen from '../../screens/game/GameScreen';
import BottomNavBar from '../main/BottomNavBar';
import Header from '../main/Header';
import { LoadingSpinner } from '../ui';
import GrantedRewardCard from './GrantedRewardCard';

const StudentSchoolView: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassWithTeacher[]>([]);
  const [rewards, setRewards] = useState<GrantedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [playingReward, setPlayingReward] = useState<GrantedReward | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const [classesRes, rewardsRes] = await Promise.all([
      schoolService.getMyClassesAsStudent(user.id),
      schoolService.getMyGrantedRewards(user.id),
    ]);
    if (classesRes.data) setClasses(classesRes.data);
    if (rewardsRes.data) setRewards(rewardsRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Live-update when a teacher grants/confirms a reward
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`school_student_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'granted_rewards',
          filter: `student_id=eq.${user.id}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleUse = (reward: GrantedReward) => {
    Alert.alert(
      'Use this reward?',
      `"${reward.title}" will be sent to your teacher to confirm.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            setBusyId(reward.id);
            // Optimistic flip
            setRewards((prev) =>
              prev.map((r) =>
                r.id === reward.id ? { ...r, status: 'redeem_requested' } : r
              )
            );
            const { error } = await schoolService.requestRedemption(reward.id);
            setBusyId(null);
            if (error) {
              Alert.alert('Error', 'Could not send your request. Please try again.');
              load();
            }
          },
        },
      ]
    );
  };

  const handlePlay = (reward: GrantedReward) => {
    setPlayingReward(reward);
  };

  const handleGameComplete = async (won: boolean) => {
    const reward = playingReward;
    setPlayingReward(null);
    if (!reward) return;
    const { error } = await schoolService.recordRewardGame(reward.id, won);
    if (error) {
      Alert.alert('Error', 'Could not save your result. Please try again.');
    } else {
      Alert.alert(
        won ? 'You won! 🎉' : 'Not this time',
        won
          ? `You won "${reward.title}"! Your teacher will confirm it in class.`
          : `"${reward.title}" didn't come through — that try is used up.`
      );
    }
    load();
  };

  if (playingReward) {
    return (
      <GameScreen
        prizeName={playingReward.title}
        prizeDescription={playingReward.description || 'Win this reward from your teacher!'}
        locationName="Classroom Reward"
        doorCount={playingReward.doors}
        onGameComplete={(won) => handleGameComplete(won)}
        onBack={() => setPlayingReward(null)}
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

  const activeRewards = rewards.filter(
    (r) => r.status === 'granted' || r.status === 'redeem_requested'
  );
  const pastRewards = rewards.filter(
    (r) => r.status === 'redeemed' || r.status === 'denied' || r.status === 'revoked' || r.status === 'lost'
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }} edges={['top']}>
      <Header
        variant="section"
        iconName="school"
        title="My School"
        subtitle="Classes & rewards from your teachers"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* My Classes */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.gray900, marginBottom: 12 }}>
          My Classes
        </Text>
        {classes.length === 0 ? (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: Colors.gray200,
            }}
          >
            <Ionicons name="school-outline" size={32} color={Colors.gray400} />
            <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
              You're not in any classes yet. Your teacher will add you.
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 24 }}>
            {classes.map((c) => (
              <View
                key={c.id}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  shadowColor: Colors.black,
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: Colors.primaryMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="book" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.gray900 }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>
                    {c.teacher_name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* My Perks */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.gray900, marginBottom: 12 }}>
          My Rewards
        </Text>
        {activeRewards.length === 0 && pastRewards.length === 0 ? (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.gray200,
            }}
          >
            <Ionicons name="ribbon-outline" size={36} color={Colors.gray400} />
            <Text style={{ color: Colors.gray700, fontWeight: '600', marginTop: 10 }}>
              No rewards yet
            </Text>
            <Text style={{ color: Colors.gray500, marginTop: 4, textAlign: 'center', fontSize: 13 }}>
              Your teacher can give you perks like a homework pass or a quiz bonus.
            </Text>
          </View>
        ) : (
          <>
            {activeRewards.map((r) => (
              <GrantedRewardCard
                key={r.id}
                reward={r}
                onUse={() => handleUse(r)}
                onPlay={() => handlePlay(r)}
                busy={busyId === r.id}
              />
            ))}

            {pastRewards.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: Colors.gray500,
                    marginTop: 12,
                    marginBottom: 8,
                  }}
                >
                  History
                </Text>
                {pastRewards.map((r) => (
                  <GrantedRewardCard key={r.id} reward={r} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

export default StudentSchoolView;
