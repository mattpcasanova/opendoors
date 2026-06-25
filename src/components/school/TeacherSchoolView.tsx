import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { DoorDistribution, organizationService } from '../../services/organizationService';
import { pushNotificationService } from '../../services/pushNotificationService';
import {
  ClassEngagement,
  ClassRow,
  GrantedRewardWithStudent,
  GroupRewardTeacher,
  RewardTemplate,
  RosterMember,
  schoolService,
} from '../../services/schoolService';

const STALE_DAYS = 14;
const ALL_PERIODS = '__all__';
const daysAgo = (iso: string | null) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null;
import { supabase } from '../../services/supabase/client';
import BottomNavBar from '../main/BottomNavBar';
import Header from '../main/Header';
import { LoadingSpinner } from '../ui';
import CreateTemplateModal from './CreateTemplateModal';
import GrantRewardModal from './GrantRewardModal';
import GroupRewardModal from './GroupRewardModal';
import InsightsModal from './InsightsModal';
import SendDoorsModal from './SendDoorsModal';
import StudentPickerModal from './StudentPickerModal';

const rosterName = (m: RosterMember) =>
  `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;

const TeacherSchoolView: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  // All students across every class (deduped) + which periods each is in, for the "All periods" tab.
  const [allStudents, setAllStudents] = useState<RosterMember[]>([]);
  const [studentClasses, setStudentClasses] = useState<Record<string, string[]>>({});
  const [engagement, setEngagement] = useState<Record<string, ClassEngagement>>({});
  const [groupRewards, setGroupRewards] = useState<GroupRewardTeacher[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [templates, setTemplates] = useState<RewardTemplate[]>([]);
  const [pending, setPending] = useState<GrantedRewardWithStudent[]>([]);
  const [sentHistory, setSentHistory] = useState<DoorDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [grantStudent, setGrantStudent] = useState<{ id: string; name: string } | null>(null);
  const [doorsStudent, setDoorsStudent] = useState<{ id: string; name: string } | null>(null);
  const [doorsBulk, setDoorsBulk] = useState<{ studentIds: string[]; label: string } | null>(null);
  const [grantBulk, setGrantBulk] = useState<{ studentIds: string[]; label: string } | null>(null);

  const loadPending = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await schoolService.getPendingRequests(user.id);
    if (data) setPending(data);
  }, [user?.id]);

  const loadTemplates = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await schoolService.listTemplates(user.id);
    if (data) setTemplates(data);
  }, [user?.id]);

  const loadRoster = useCallback(async (classId: string) => {
    const [rosterRes, engRes, groupRes] = await Promise.all([
      schoolService.getClassRoster(classId),
      schoolService.getClassEngagement(classId),
      schoolService.getClassGroupRewards(classId),
    ]);
    setRoster(rosterRes.data || []);
    setGroupRewards(groupRes.data || []);
    const map: Record<string, ClassEngagement> = {};
    (engRes.data || []).forEach((e) => {
      map[e.student_id] = e;
    });
    setEngagement(map);
  }, []);

  const loadSentHistory = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await organizationService.getDistributorHistory(user.id);
    if (data) setSentHistory(data);
  }, [user?.id]);

  // Union of every class roster (deduped), with the period names each student belongs to.
  const loadAllStudents = useCallback(async (cls: ClassRow[]) => {
    const results = await Promise.all(
      cls.map((c) => schoolService.getClassRoster(c.id).then((r) => ({ c, data: r.data || [] })))
    );
    const byId = new Map<string, RosterMember>();
    const periods: Record<string, string[]> = {};
    for (const { c, data } of results) {
      for (const m of data) {
        if (!byId.has(m.student_id)) byId.set(m.student_id, m);
        (periods[m.student_id] = periods[m.student_id] || []).push(c.name);
      }
    }
    const sorted = Array.from(byId.values()).sort((a, b) =>
      `${a.last_name || ''}${a.first_name || ''}`.localeCompare(`${b.last_name || ''}${b.first_name || ''}`)
    );
    setAllStudents(sorted);
    setStudentClasses(periods);
  }, []);

  const init = useCallback(async () => {
    if (!user?.id) return;
    const { data: classData } = await schoolService.getMyClassesAsTeacher(user.id);
    const cls = classData || [];
    setClasses(cls);
    const firstId = cls[0]?.id ?? null;
    setSelectedClassId((prev) => prev ?? firstId);
    await Promise.all([
      loadTemplates(),
      loadPending(),
      loadSentHistory(),
      loadAllStudents(cls),
      firstId ? loadRoster(firstId) : Promise.resolve(),
    ]);
    setLoading(false);
  }, [user?.id, loadTemplates, loadPending, loadSentHistory, loadRoster, loadAllStudents]);

  useEffect(() => {
    init();
  }, [init]);

  // Reload roster when the selected class changes (skip the "All periods" tab)
  useEffect(() => {
    if (selectedClassId && selectedClassId !== ALL_PERIODS) loadRoster(selectedClassId);
  }, [selectedClassId, loadRoster]);

  // Live-update pending requests
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`school_teacher_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'granted_rewards',
          filter: `teacher_id=eq.${user.id}`,
        },
        () => loadPending()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadPending]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadTemplates(),
      loadPending(),
      loadSentHistory(),
      loadAllStudents(classes),
      selectedClassId && selectedClassId !== ALL_PERIODS ? loadRoster(selectedClassId) : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

  const handleStudentTap = (m: RosterMember) => {
    const student = { id: m.student_id, name: rosterName(m) };
    Alert.alert(student.name, 'What would you like to do?', [
      { text: 'Give a reward', onPress: () => setGrantStudent(student) },
      { text: 'Send doors', onPress: () => setDoorsStudent(student) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleConfirm = async (item: GrantedRewardWithStudent) => {
    setPending((prev) => prev.filter((p) => p.id !== item.id));
    const { error } = await schoolService.confirmRedemption(item.id);
    if (error) {
      Alert.alert('Error', 'Could not confirm. Please try again.');
      loadPending();
      return;
    }
    pushNotificationService
      .sendPushToUser(item.student_id, 'Reward confirmed! 🎉', `Your "${item.title}" is approved.`, {
        type: 'reward_confirmed',
      })
      .catch(() => {});
  };

  const handleDeny = async (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    const { error } = await schoolService.denyRedemption(id);
    if (error) {
      Alert.alert('Error', 'Could not update. Please try again.');
      loadPending();
    }
  };

  const handleDeleteGroupReward = (g: GroupRewardTeacher) => {
    Alert.alert('Delete group reward?', `"${g.title}" will be removed. Doors students already pooled are not returned.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setGroupRewards((prev) => prev.filter((x) => x.id !== g.id));
          const { error } = await schoolService.deactivateGroupReward(g.id);
          if (error && selectedClassId) loadRoster(selectedClassId);
        },
      },
    ]);
  };

  const handleDeleteTemplate = (t: RewardTemplate) => {
    Alert.alert(
      'Delete reward?',
      `"${t.title}" will be removed from your list and students won't be able to get it anymore. Rewards students already earned are not affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setTemplates((prev) => prev.filter((x) => x.id !== t.id));
            const { error } = await schoolService.deactivateTemplate(t.id);
            if (error) {
              Alert.alert('Error', 'Could not delete the reward. Please try again.');
              loadTemplates();
            }
          },
        },
      ]
    );
  };

  const openClassBulk = (kind: 'doors' | 'reward') => {
    if (roster.length === 0) {
      Alert.alert('No students', 'This class has no students enrolled yet.');
      return;
    }
    const cls = classes.find((c) => c.id === selectedClassId);
    const target = { studentIds: roster.map((m) => m.student_id), label: `${cls?.name ?? 'class'} (whole class)` };
    if (kind === 'doors') setDoorsBulk(target);
    else setGrantBulk(target);
  };

  const handleRegenerateCode = () => {
    if (!selectedClassId) return;
    Alert.alert('New class code?', 'The current code will stop working for new students.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Regenerate',
        onPress: async () => {
          const { data, error } = await schoolService.regenerateClassCode(selectedClassId);
          if (error || !data) {
            Alert.alert('Error', error || 'Could not regenerate the code.');
            return;
          }
          setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, join_code: data } : c)));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const isAll = selectedClassId === ALL_PERIODS;
  // On "All periods" the student list/search spans every class; otherwise just the selected class.
  const activeRoster = isAll ? allStudents : roster;
  // Pending requests are loaded teacher-wide; scope them to the selected class.
  const visiblePending = isAll ? pending : pending.filter((p) => p.class_id === selectedClassId);
  // Rewards usable for granting in the selected class (class-specific + all-classes).
  const templatesForSelected = templates.filter(
    (t) => t.class_id === null || t.class_id === selectedClassId
  );
  // What the Reward Items list shows: the whole catalog on "All periods",
  // otherwise only this class's rewards plus any that apply to all classes.
  const displayedTemplates = isAll ? templates : templatesForSelected;
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }} edges={['top']}>
      <Header
        variant="section"
        iconName="school"
        title="My Classroom"
        subtitle="Reward your students"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {classes.length === 0 ? (
          <View style={cardEmpty}>
            <Ionicons name="school-outline" size={32} color={Colors.gray400} />
            <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
              No classes yet. Classes are set up for you. Check back soon.
            </Text>
          </View>
        ) : (
          <>
            {/* Class selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
              contentContainerStyle={{ gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedClassId(ALL_PERIODS)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: isAll ? Colors.primary : Colors.white,
                  borderWidth: 1,
                  borderColor: isAll ? Colors.primary : Colors.gray200,
                }}
              >
                <Text style={{ color: isAll ? Colors.white : Colors.gray700, fontWeight: '600' }}>
                  All periods
                </Text>
              </TouchableOpacity>
              {classes.map((c) => {
                const active = c.id === selectedClassId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedClassId(c.id)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: active ? Colors.primary : Colors.white,
                      borderWidth: 1,
                      borderColor: active ? Colors.primary : Colors.gray200,
                    }}
                  >
                    <Text style={{ color: active ? Colors.white : Colors.gray700, fontWeight: '600' }}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Class join code */}
            {selectedClass?.join_code ? (
              <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow }}>
                <Text style={{ fontSize: 13, color: Colors.gray500, marginBottom: 6 }}>
                  Join code for {selectedClass.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 30, fontWeight: '800', color: Colors.primary, letterSpacing: 6 }}>
                    {selectedClass.join_code}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() =>
                        Share.share({
                          message: `Join my class "${selectedClass.name}" on OpenDoors. Open the app, go to School, and enter code ${selectedClass.join_code}.`,
                        })
                      }
                      style={codeBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="share-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        await Clipboard.setStringAsync(selectedClass.join_code as string);
                        Alert.alert('Copied', 'Class code copied to clipboard.');
                      }}
                      style={codeBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRegenerateCode} style={codeBtn} activeOpacity={0.7}>
                      <Ionicons name="refresh" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: Colors.gray500, marginTop: 8 }}>
                  Students join from their School tab with this code.
                </Text>
              </View>
            ) : null}

            {/* Quick actions */}
            {activeRoster.length > 0 && (
              <View style={{ marginBottom: 20, gap: 10 }}>
                {/* Send to a single student (search), works on any tab */}
                <TouchableOpacity
                  onPress={() => setShowStudentPicker(true)}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: Colors.primary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                  }}
                >
                  <Ionicons name="person-add" size={20} color={Colors.white} />
                  <Text style={{ flex: 1, color: Colors.white, fontWeight: '700', fontSize: 15 }}>
                    {isAll ? 'Send doors to any student' : 'Send doors to a student'}
                  </Text>
                  <Ionicons name="search" size={18} color={Colors.white} />
                </TouchableOpacity>

                {/* Whole-class actions (specific class only) */}
                {!isAll && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => openClassBulk('doors')} activeOpacity={0.85} style={classActionBtn}>
                      <Ionicons name="ticket" size={18} color={Colors.primary} />
                      <Text style={classActionLabel}>Doors to class</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openClassBulk('reward')} activeOpacity={0.85} style={classActionBtn}>
                      <Ionicons name="gift" size={18} color={Colors.primary} />
                      <Text style={classActionLabel}>Reward to class</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Insights */}
            {!isAll && (
            <TouchableOpacity
              onPress={() => setShowInsights(true)}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: Colors.white,
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                ...shadow,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="stats-chart" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.gray900 }}>Insights</Text>
                <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>
                  Food vs. school choices · doors vs. scores
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
            </TouchableOpacity>
            )}

            {/* Group rewards (student-funded) */}
            {!isAll && (
            <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: Colors.gray500 }}>Group rewards</Text>
                <TouchableOpacity onPress={() => setShowGroupModal(true)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="add-circle" size={18} color={Colors.primary} />
                  <Text style={{ color: Colors.primary, fontWeight: '700' }}>New</Text>
                </TouchableOpacity>
              </View>
              {groupRewards.length === 0 ? (
                <Text style={{ color: Colors.gray500, fontSize: 13 }}>
                  Let the class pool their own doors toward a shared prize, like a pizza party.
                </Text>
              ) : (
                groupRewards.map((g, idx) => {
                  const pct = Math.min(100, Math.round((g.progress / Math.max(1, g.target_doors)) * 100));
                  const done = g.progress >= g.target_doors;
                  return (
                    <View key={g.id} style={{ marginTop: idx === 0 ? 0 : 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Ionicons name={done ? 'trophy' : g.reward_class === 'food' ? 'fast-food' : 'school'} size={14} color={done ? Colors.successDark : Colors.primary} />
                        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: Colors.gray800 }} numberOfLines={1}>
                          {g.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: Colors.gray500 }}>
                          {g.progress}/{g.target_doors}
                        </Text>
                        <TouchableOpacity onPress={() => handleDeleteGroupReward(g)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Ionicons name="trash-outline" size={16} color={Colors.gray400} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ height: 8, borderRadius: 4, backgroundColor: Colors.gray200, overflow: 'hidden' }}>
                        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: done ? Colors.success : Colors.primary }} />
                      </View>
                      <Text style={{ fontSize: 12, color: done ? Colors.successDark : Colors.gray500, marginTop: 4 }}>
                        {done ? 'Goal reached! 🎉' : `${g.contributors} contributor${g.contributors === 1 ? '' : 's'}`}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
            )}

            {/* Pending requests (scoped to the selected class) */}
            {visiblePending.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={sectionTitle}>
                  Pending Requests ({visiblePending.length})
                </Text>
                {visiblePending.map((p) => (
                  <View
                    key={p.id}
                    style={{
                      backgroundColor: Colors.white,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: Colors.warning,
                      ...shadow,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.gray900 }}>{p.title}</Text>
                    <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>
                      {p.student_name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                      <TouchableOpacity
                        onPress={() => handleConfirm(p)}
                        activeOpacity={0.85}
                        style={{
                          flex: 1,
                          backgroundColor: Colors.success,
                          borderRadius: 10,
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color={Colors.white} />
                        <Text style={{ color: Colors.white, fontWeight: '700' }}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeny(p.id)}
                        activeOpacity={0.85}
                        style={{
                          paddingHorizontal: 18,
                          backgroundColor: Colors.gray100,
                          borderRadius: 10,
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Text style={{ color: Colors.gray600, fontWeight: '700' }}>Deny</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Reward items (templates): the perks you can hand out */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[sectionTitle, { marginBottom: 0 }]}>
                {isAll ? 'All Reward Items' : 'Reward Items'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="add-circle" size={20} color={Colors.primary} />
                <Text style={{ color: Colors.primary, fontWeight: '700' }}>New</Text>
              </TouchableOpacity>
            </View>
            {displayedTemplates.length === 0 ? (
              <View style={cardEmpty}>
                <Ionicons name="ribbon-outline" size={28} color={Colors.gray400} />
                <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
                  {isAll
                    ? 'Create rewards like "Homework Pass" to give to your students.'
                    : `No rewards for ${selectedClass?.name ?? 'this class'} yet. Tap "New" to add one.`}
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }}>
                {displayedTemplates.map((t) => (
                  <View
                    key={t.id}
                    style={{
                      backgroundColor: Colors.white,
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      ...shadow,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: Colors.primaryMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={t.reward_class === 'school' ? 'school' : 'fast-food'}
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>{t.title}</Text>
                      {t.description ? (
                        <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>{t.description}</Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons
                            name={t.reward_class === 'school' ? 'school' : 'fast-food'}
                            size={13}
                            color={Colors.gray500}
                          />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.gray500 }}>
                            {t.reward_class === 'school' ? 'School' : 'Food'}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons
                            name={t.reward_type === 'game' ? 'game-controller' : 'gift'}
                            size={13}
                            color={Colors.primary}
                          />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>
                            {t.reward_type === 'game' ? `Play to win · ${t.doors} doors` : 'Direct gift'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                      <Text style={{ fontSize: 12, color: Colors.gray400 }}>
                        {t.class_id ? classes.find((c) => c.id === t.class_id)?.name ?? 'Class' : 'All classes'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteTemplate(t)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.gray400} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Roster */}
            {!isAll && (
            <>
            <Text style={sectionTitle}>Students</Text>
            {roster.length === 0 ? (
              <View style={cardEmpty}>
                <Ionicons name="people-outline" size={28} color={Colors.gray400} />
                <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
                  No students enrolled in this class yet.
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }}>
                {(() => {
                  const staleCount = roster.filter((m) => {
                    const d = daysAgo(engagement[m.student_id]?.last_door_at ?? null);
                    return d === null || d >= STALE_DAYS;
                  }).length;
                  return staleCount > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons name="alert-circle" size={18} color={Colors.warningDark} />
                      <Text style={{ flex: 1, fontSize: 13, color: Colors.warningDark, fontWeight: '600' }}>
                        {staleCount} student{staleCount === 1 ? " hasn't" : "s haven't"} been rewarded recently.
                      </Text>
                    </View>
                  ) : null;
                })()}
                {roster.map((m) => {
                  const eng = engagement[m.student_id];
                  const d = daysAgo(eng?.last_door_at ?? null);
                  const stale = d === null || d >= STALE_DAYS;
                  return (
                    <TouchableOpacity
                      key={m.student_id}
                      onPress={() => handleStudentTap(m)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: Colors.white,
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderLeftWidth: stale ? 3 : 0,
                        borderLeftColor: Colors.warning,
                        ...shadow,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: Colors.primaryMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                          {(m.first_name?.[0] || m.email[0] || '?').toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>
                          {rosterName(m)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: stale ? Colors.warningDark : Colors.gray500,
                            marginTop: 2,
                          }}
                        >
                          {eng?.last_door_at
                            ? `Rewarded ${d}d ago · ${eng.doors_received} total`
                            : 'Never rewarded'}
                        </Text>
                      </View>
                      <Ionicons name="gift-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            </>
            )}

            {/* All-periods student list (every class, deduped) */}
            {isAll && (
              <>
                <Text style={sectionTitle}>Students ({allStudents.length})</Text>
                {allStudents.length === 0 ? (
                  <View style={cardEmpty}>
                    <Ionicons name="people-outline" size={28} color={Colors.gray400} />
                    <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
                      No students enrolled in any class yet.
                    </Text>
                  </View>
                ) : (
                  <View style={{ marginBottom: 24 }}>
                    {allStudents.map((m) => (
                      <TouchableOpacity
                        key={m.student_id}
                        onPress={() => setDoorsStudent({ id: m.student_id, name: rosterName(m) })}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: Colors.white,
                          borderRadius: 14,
                          padding: 14,
                          marginBottom: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          ...shadow,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: Colors.primaryMuted,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                            {(m.first_name?.[0] || m.email[0] || '?').toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>
                            {rosterName(m)}
                          </Text>
                          <Text style={{ fontSize: 12, color: Colors.gray500, marginTop: 2 }} numberOfLines={1}>
                            {(studentClasses[m.student_id] || []).join(' · ') || m.email}
                          </Text>
                        </View>
                        <Ionicons name="ticket-outline" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Doors Sent history */}
            <Text style={[sectionTitle, { marginTop: 24 }]}>Doors Sent</Text>
            {sentHistory.length === 0 ? (
              <View style={cardEmpty}>
                <Ionicons name="paper-plane-outline" size={28} color={Colors.gray400} />
                <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
                  Doors you send to students will show up here.
                </Text>
              </View>
            ) : (
              sentHistory.slice(0, 20).map((d) => (
                <View
                  key={d.id}
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    ...shadow,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: Colors.primaryMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="paper-plane" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>
                      {d.recipient_name || 'Student'}
                    </Text>
                    <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>
                      {d.reason || 'Doors sent'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary }}>
                      +{d.doors_sent}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.gray400, marginTop: 2 }}>
                      {new Date(d.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <BottomNavBar />

      {/* Modals */}
      {user?.id && (
        <CreateTemplateModal
          visible={showCreate}
          teacherId={user.id}
          classes={classes}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadTemplates();
          }}
        />
      )}

      {selectedClassId && (
        <GrantRewardModal
          visible={!!grantStudent || !!grantBulk}
          classId={selectedClassId}
          student={grantStudent}
          bulk={grantBulk}
          templates={templatesForSelected}
          onClose={() => {
            setGrantStudent(null);
            setGrantBulk(null);
          }}
          onGranted={() => {
            const wasBulk = !!grantBulk;
            setGrantStudent(null);
            setGrantBulk(null);
            Alert.alert('Reward sent!', wasBulk ? 'Your whole class will see it.' : 'Your student will see it in the app.');
          }}
        />
      )}

      {selectedClassId && (
        <GroupRewardModal
          visible={showGroupModal}
          classId={selectedClassId}
          onClose={() => setShowGroupModal(false)}
          onCreated={() => {
            setShowGroupModal(false);
            if (selectedClassId) loadRoster(selectedClassId);
          }}
        />
      )}

      <StudentPickerModal
        visible={showStudentPicker}
        roster={activeRoster}
        title={isAll ? 'Send doors to any student' : 'Send doors to a student'}
        getSubtitle={(studentId) => {
          if (isAll) return (studentClasses[studentId] || []).join(' · ') || null;
          const d = daysAgo(engagement[studentId]?.last_door_at ?? null);
          if (d === null) return 'Never rewarded';
          const total = engagement[studentId]?.doors_received ?? 0;
          return `Rewarded ${d}d ago · ${total} total`;
        }}
        onClose={() => setShowStudentPicker(false)}
        onSelect={(student) => {
          setShowStudentPicker(false);
          setDoorsStudent(student);
        }}
      />

      {selectedClassId && (
        <InsightsModal
          visible={showInsights}
          classId={selectedClassId}
          className={selectedClass?.name ?? 'Class'}
          roster={roster}
          onClose={() => setShowInsights(false)}
        />
      )}

      {user?.id && (
        <SendDoorsModal
          visible={!!doorsStudent || !!doorsBulk}
          teacherId={user.id}
          student={doorsStudent}
          bulk={doorsBulk}
          onClose={() => {
            setDoorsStudent(null);
            setDoorsBulk(null);
          }}
          onSent={() => {
            const wasBulk = !!doorsBulk;
            setDoorsStudent(null);
            setDoorsBulk(null);
            loadSentHistory();
            Alert.alert('Doors sent!', wasBulk ? 'Your whole class can now play.' : 'Your student can now play.');
          }}
        />
      )}
    </SafeAreaView>
  );
};

const sectionTitle = {
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

const codeBtn = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: Colors.primaryMuted,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const classActionBtn = {
  flex: 1,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 6,
  backgroundColor: Colors.white,
  borderWidth: 1,
  borderColor: Colors.primary,
  borderRadius: 12,
  paddingVertical: 12,
};

const classActionLabel = {
  color: Colors.primary,
  fontWeight: '700' as const,
  fontSize: 14,
};

const cardEmpty = {
  backgroundColor: Colors.white,
  borderRadius: 16,
  padding: 20,
  alignItems: 'center' as const,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: Colors.gray200,
};

export default TeacherSchoolView;
