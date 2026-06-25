import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { pushNotificationService } from '../../services/pushNotificationService';
import GameScreen from '../../screens/game/GameScreen';
import {
  DoorMessage,
  GrantedReward,
  GroupRewardStudent,
  RewardTemplate,
  schoolService,
  TeacherSummary,
} from '../../services/schoolService';
import { supabase } from '../../services/supabase/client';
import Header from '../main/Header';
import { LoadingSpinner } from '../ui';
import ContributeModal from './ContributeModal';
import GrantedRewardCard from './GrantedRewardCard';

const teacherName = (t: TeacherSummary) =>
  `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email;

interface Props {
  teacher: TeacherSummary;
  onBack: () => void;
}

interface DoorBalance {
  total: number;
  either: number;
  food: number;
  school: number;
}

const TeacherDetailView: React.FC<Props> = ({ teacher, onBack }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<DoorBalance>({
    total: teacher.door_count,
    either: teacher.either_doors,
    food: teacher.food_doors,
    school: teacher.school_doors,
  });
  const [items, setItems] = useState<RewardTemplate[]>([]);
  const [rewards, setRewards] = useState<GrantedReward[]>([]);
  const [groupRewards, setGroupRewards] = useState<GroupRewardStudent[]>([]);
  const [contributeTo, setContributeTo] = useState<GroupRewardStudent | null>(null);
  const [messages, setMessages] = useState<DoorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [playingReward, setPlayingReward] = useState<GrantedReward | null>(null);

  const load = useCallback(async () => {
    const [itemsRes, rewardsRes, teachersRes, messagesRes, groupRes] = await Promise.all([
      schoolService.getTeacherItems(teacher.teacher_id),
      schoolService.getMyRewardsFromTeacher(teacher.teacher_id),
      schoolService.getMyTeachers(),
      schoolService.getDoorMessagesFromTeacher(teacher.teacher_id),
      schoolService.getGroupRewardsForTeacher(teacher.teacher_id),
    ]);
    if (itemsRes.data) setItems(itemsRes.data);
    if (rewardsRes.data) setRewards(rewardsRes.data);
    if (messagesRes.data) setMessages(messagesRes.data);
    if (groupRes.data) setGroupRewards(groupRes.data);
    if (teachersRes.data) {
      const me = teachersRes.data.find((t) => t.teacher_id === teacher.teacher_id);
      if (me) {
        setBalance({
          total: me.door_count,
          either: me.either_doors,
          food: me.food_doors,
          school: me.school_doors,
        });
      }
    }
    setLoading(false);
  }, [teacher.teacher_id]);

  // Doors spendable on a given reward class: single-purpose doors for that
  // class plus any "their choice" doors.
  const spendableForClass = (rewardClass: 'food' | 'school') =>
    (rewardClass === 'school' ? balance.school : balance.food) + balance.either;
  const spendableFor = (item: RewardTemplate) => spendableForClass(item.reward_class);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`teacher_detail_${user.id}_${teacher.teacher_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'granted_rewards', filter: `student_id=eq.${user.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'earned_rewards', filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, teacher.teacher_id, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSpend = (item: RewardTemplate) => {
    if (spendableFor(item) <= 0) {
      const kind = item.reward_class === 'school' ? 'school' : 'food';
      Alert.alert(
        'No doors for this',
        balance.total > 0
          ? `Your doors from ${teacherName(teacher)} can't be used on ${kind} rewards. Ask for a ${kind} or "their choice" door.`
          : `Ask ${teacherName(teacher)} to send you doors first.`
      );
      return;
    }
    const isGame = item.reward_type === 'game';
    Alert.alert(
      isGame ? 'Play for this reward?' : 'Claim this reward?',
      `This spends 1 of ${teacherName(teacher)}'s doors to ${isGame ? 'play for' : 'claim'} "${item.title}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isGame ? 'Play' : 'Claim',
          onPress: async () => {
            setBusyId(item.id);
            const { data, error } = await schoolService.spendDoorOnItem(item.id);
            setBusyId(null);
            if (error || !data) {
              Alert.alert('Error', error || 'Could not do that. Please try again.');
              load();
              return;
            }
            if (data.reward_type === 'game') {
              setPlayingReward(data);
            } else {
              pushNotificationService
                .sendPushToUser(teacher.teacher_id, 'New reward request', `A student claimed "${data.title}".`, {
                  type: 'reward_claim',
                })
                .catch(() => {});
              Alert.alert('Claimed!', `${teacherName(teacher)} will confirm "${data.title}" in class.`);
              load();
            }
          },
        },
      ]
    );
  };

  const handleGameComplete = async (won: boolean) => {
    const reward = playingReward;
    setPlayingReward(null);
    if (!reward) return;
    const { error } = await schoolService.recordRewardGame(reward.id, won);
    if (error) {
      Alert.alert('Error', 'Could not save your result.');
    } else {
      if (won) {
        pushNotificationService
          .sendPushToUser(teacher.teacher_id, 'A student won a reward 🎉', `Someone won "${reward.title}". Confirm it in class.`, {
            type: 'reward_won',
          })
          .catch(() => {});
      }
      Alert.alert(
        won ? 'You won! 🎉' : 'Not this time',
        won
          ? `You won "${reward.title}"! Your teacher will confirm it in class.`
          : `"${reward.title}" didn't come through. That door is used up.`
      );
    }
    load();
  };

  if (playingReward) {
    return (
      <GameScreen
        prizeName={playingReward.title}
        prizeDescription={playingReward.description || 'Win this reward from your teacher!'}
        locationName={teacherName(teacher)}
        doorCount={playingReward.doors}
        onGameComplete={(won) => handleGameComplete(won)}
        onBack={() => {
          setPlayingReward(null);
          load();
        }}
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

  const activeRewards = rewards.filter((r) => r.status === 'granted' || r.status === 'redeem_requested');
  const pastRewards = rewards.filter(
    (r) => r.status === 'redeemed' || r.status === 'denied' || r.status === 'revoked' || r.status === 'lost'
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }} edges={['top']}>
      <Header
        variant="section"
        iconName="school"
        title={teacherName(teacher)}
        subtitle={`${balance.total} ${balance.total === 1 ? 'door' : 'doors'} from this teacher`}
        showBackButton
        onBackPress={onBack}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Door balance banner */}
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: balance.total > 0 ? Colors.primary : Colors.gray200,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="ticket" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.gray900 }}>{balance.total}</Text>
              <Text style={{ fontSize: 13, color: Colors.gray500 }}>
                {balance.total === 1 ? 'door' : 'doors'} to spend with {teacherName(teacher)}
              </Text>
            </View>
          </View>
          {balance.total > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {balance.either > 0 && (
                <DoorChip icon="swap-horizontal" label={`${balance.either} your choice`} />
              )}
              {balance.food > 0 && <DoorChip icon="fast-food" label={`${balance.food} food only`} />}
              {balance.school > 0 && <DoorChip icon="school" label={`${balance.school} school only`} />}
            </View>
          )}
        </View>

        {/* Group rewards the class is funding together */}
        {groupRewards.length > 0 && (
          <>
            <Text style={titleStyle}>Class group rewards</Text>
            <View style={{ marginBottom: 24 }}>
              {groupRewards.map((g) => {
                const pct = Math.min(100, Math.round((g.progress / Math.max(1, g.target_doors)) * 100));
                const done = g.progress >= g.target_doors;
                const canGive = spendableForClass(g.reward_class) > 0 && !done;
                return (
                  <View key={g.id} style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 12, ...shadow }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Ionicons name={done ? 'trophy' : g.reward_class === 'food' ? 'fast-food' : 'school'} size={18} color={done ? Colors.successDark : Colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.gray900 }}>{g.title}</Text>
                        <Text style={{ fontSize: 12, color: Colors.gray500 }}>{g.class_name}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.gray700 }}>
                        {g.progress}/{g.target_doors}
                      </Text>
                    </View>
                    {g.description ? (
                      <Text style={{ fontSize: 13, color: Colors.gray500, marginBottom: 8 }}>{g.description}</Text>
                    ) : null}
                    <View style={{ height: 8, borderRadius: 4, backgroundColor: Colors.gray200, overflow: 'hidden' }}>
                      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: done ? Colors.success : Colors.primary }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: done ? Colors.successDark : Colors.gray500 }}>
                        {done ? 'Unlocked! 🎉' : g.my_contribution > 0 ? `You've given ${g.my_contribution}` : 'Chip in your doors'}
                      </Text>
                      {!done && (
                        <TouchableOpacity
                          onPress={() =>
                            canGive
                              ? setContributeTo(g)
                              : Alert.alert(
                                  'No doors to give',
                                  `You need ${g.reward_class} or "your choice" doors from ${teacherName(teacher)} to contribute.`
                                )
                          }
                          activeOpacity={0.85}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: canGive ? Colors.primary : Colors.gray300,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                          }}
                        >
                          <Ionicons name="add" size={16} color={Colors.white} />
                          <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>Contribute</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Shout-outs attached to doors */}
        {messages.filter((m) => m.reason).length > 0 && (
          <>
            <Text style={titleStyle}>Notes from {teacherName(teacher)}</Text>
            <View style={{ marginBottom: 24 }}>
              {messages
                .filter((m) => m.reason)
                .slice(0, 5)
                .map((m) => (
                  <View
                    key={m.id}
                    style={{
                      backgroundColor: Colors.white,
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 10,
                      flexDirection: 'row',
                      gap: 10,
                      ...shadow,
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={18} color={Colors.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, color: Colors.gray800, fontStyle: 'italic' }}>
                        "{m.reason}"
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.gray400, marginTop: 4 }}>
                        +{m.doors_sent} {m.doors_sent === 1 ? 'door' : 'doors'} ·{' '}
                        {new Date(m.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </>
        )}

        {/* Item menu */}
        <Text style={titleStyle}>Rewards you can get</Text>
        {items.length === 0 ? (
          <View style={emptyCard}>
            <Ionicons name="ribbon-outline" size={28} color={Colors.gray400} />
            <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
              {teacherName(teacher)} hasn't added any rewards yet.
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 24 }}>
            {items.map((item) => {
              const isGame = item.reward_type === 'game';
              const isSchool = item.reward_class === 'school';
              const disabled = spendableFor(item) <= 0;
              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    opacity: disabled ? 0.6 : 1,
                    ...shadow,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={isSchool ? 'school' : 'fast-food'} size={22} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.gray900 }}>{item.title}</Text>
                      {item.description ? (
                        <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>{item.description}</Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.gray500 }}>
                          {isSchool ? 'School reward' : 'Food reward'}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>
                          {isGame ? `Play to win · 1 in ${item.doors}` : 'Guaranteed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleSpend(item)}
                    disabled={disabled || busyId === item.id}
                    activeOpacity={0.85}
                    style={{
                      marginTop: 12,
                      backgroundColor: disabled ? Colors.gray300 : Colors.primary,
                      borderRadius: 12,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {busyId === item.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons name={isGame ? 'game-controller' : 'hand-left'} size={18} color={Colors.white} />
                    )}
                    <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>
                      {isGame ? 'Play' : 'Claim'} · spend 1 door
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Active: paid tries to play + pending confirmations */}
        {activeRewards.length > 0 && (
          <>
            <Text style={titleStyle}>Your tries &amp; pending</Text>
            {activeRewards.map((r) => (
              <GrantedRewardCard key={r.id} reward={r} onPlay={() => setPlayingReward(r)} />
            ))}
          </>
        )}

        {/* History */}
        {pastRewards.length > 0 && (
          <>
            <Text style={[titleStyle, { color: Colors.gray500, fontSize: 14 }]}>History</Text>
            {pastRewards.map((r) => (
              <GrantedRewardCard key={r.id} reward={r} />
            ))}
          </>
        )}
      </ScrollView>

      <ContributeModal
        visible={!!contributeTo}
        reward={contributeTo}
        maxDoors={contributeTo ? spendableForClass(contributeTo.reward_class) : 0}
        onClose={() => setContributeTo(null)}
        onContributed={() => {
          setContributeTo(null);
          load();
        }}
      />
    </SafeAreaView>
  );
};

const DoorChip: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = ({ icon, label }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: Colors.gray100,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 10,
    }}
  >
    <Ionicons name={icon} size={13} color={Colors.gray600} />
    <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.gray700 }}>{label}</Text>
  </View>
);

const titleStyle = {
  fontSize: 18,
  fontWeight: '700' as const,
  color: Colors.gray900,
  marginBottom: 12,
};

const shadow = {
  shadowColor: Colors.black,
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

const emptyCard = {
  backgroundColor: Colors.white,
  borderRadius: 16,
  padding: 20,
  alignItems: 'center' as const,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: Colors.gray200,
};

export default TeacherDetailView;
