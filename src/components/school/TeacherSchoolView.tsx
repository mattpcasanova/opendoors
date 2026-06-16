import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { DoorDistribution, organizationService } from '../../services/organizationService';
import {
  ClassRow,
  GrantedRewardWithStudent,
  RewardTemplate,
  RosterMember,
  schoolService,
} from '../../services/schoolService';
import { supabase } from '../../services/supabase/client';
import BottomNavBar from '../main/BottomNavBar';
import { LoadingSpinner } from '../ui';
import CreateTemplateModal from './CreateTemplateModal';
import GrantRewardModal from './GrantRewardModal';
import SendDoorsModal from './SendDoorsModal';

const rosterName = (m: RosterMember) =>
  `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;

const TeacherSchoolView: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [templates, setTemplates] = useState<RewardTemplate[]>([]);
  const [pending, setPending] = useState<GrantedRewardWithStudent[]>([]);
  const [sentHistory, setSentHistory] = useState<DoorDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [grantStudent, setGrantStudent] = useState<{ id: string; name: string } | null>(null);
  const [doorsStudent, setDoorsStudent] = useState<{ id: string; name: string } | null>(null);

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
    const { data } = await schoolService.getClassRoster(classId);
    setRoster(data || []);
  }, []);

  const loadSentHistory = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await organizationService.getDistributorHistory(user.id);
    if (data) setSentHistory(data);
  }, [user?.id]);

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
      firstId ? loadRoster(firstId) : Promise.resolve(),
    ]);
    setLoading(false);
  }, [user?.id, loadTemplates, loadPending, loadSentHistory, loadRoster]);

  useEffect(() => {
    init();
  }, [init]);

  // Reload roster when the selected class changes
  useEffect(() => {
    if (selectedClassId) loadRoster(selectedClassId);
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
      selectedClassId ? loadRoster(selectedClassId) : Promise.resolve(),
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

  const handleConfirm = async (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    const { error } = await schoolService.confirmRedemption(id);
    if (error) {
      Alert.alert('Error', 'Could not confirm. Please try again.');
      loadPending();
    }
  };

  const handleDeny = async (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    const { error } = await schoolService.denyRedemption(id);
    if (error) {
      Alert.alert('Error', 'Could not update. Please try again.');
      loadPending();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const templatesForSelected = templates.filter(
    (t) => t.class_id === null || t.class_id === selectedClassId
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark, Colors.success]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={28} color={Colors.white} />
          </View>
          <View>
            <Text style={{ color: Colors.white, fontSize: 26, fontWeight: '800' }}>My Classroom</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Reward your students
            </Text>
          </View>
        </View>
      </LinearGradient>

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
              No classes yet. Classes are set up for you — check back soon.
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

            {/* Pending requests */}
            {pending.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={sectionTitle}>
                  Pending Requests ({pending.length})
                </Text>
                {pending.map((p) => (
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
                        onPress={() => handleConfirm(p.id)}
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

            {/* Roster */}
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
                {roster.map((m) => (
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
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>
                      {rosterName(m)}
                    </Text>
                    <Ionicons name="gift-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Templates */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[sectionTitle, { marginBottom: 0 }]}>My Rewards</Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="add-circle" size={20} color={Colors.primary} />
                <Text style={{ color: Colors.primary, fontWeight: '700' }}>New</Text>
              </TouchableOpacity>
            </View>
            {templates.length === 0 ? (
              <View style={cardEmpty}>
                <Ionicons name="ribbon-outline" size={28} color={Colors.gray400} />
                <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
                  Create rewards like "Homework Pass" to give to your students.
                </Text>
              </View>
            ) : (
              templates.map((t) => (
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
                    <Ionicons name="ribbon" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.gray900 }}>{t.title}</Text>
                    {t.description ? (
                      <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>{t.description}</Text>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.gray400 }}>
                    {t.class_id ? classes.find((c) => c.id === t.class_id)?.name ?? 'Class' : 'All classes'}
                  </Text>
                </View>
              ))
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
          visible={!!grantStudent}
          classId={selectedClassId}
          student={grantStudent}
          templates={templatesForSelected}
          onClose={() => setGrantStudent(null)}
          onGranted={() => {
            setGrantStudent(null);
            Alert.alert('Reward sent!', 'Your student will see it in the app.');
          }}
        />
      )}

      {user?.id && (
        <SendDoorsModal
          visible={!!doorsStudent}
          teacherId={user.id}
          student={doorsStudent}
          onClose={() => setDoorsStudent(null)}
          onSent={() => {
            setDoorsStudent(null);
            loadSentHistory();
            Alert.alert('Doors sent!', 'Your student can now play.');
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
