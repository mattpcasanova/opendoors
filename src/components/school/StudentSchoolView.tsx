import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import {
  ClassGoal,
  ClassWithTeacher,
  schoolService,
  TeacherSummary,
} from '../../services/schoolService';
import { supabase } from '../../services/supabase/client';
import BottomNavBar from '../main/BottomNavBar';
import Header from '../main/Header';
import { LoadingSpinner } from '../ui';
import ClassGoalBar from './ClassGoalBar';
import JoinClassModal from './JoinClassModal';
import TeacherDetailView from './TeacherDetailView';

const teacherName = (t: TeacherSummary) =>
  `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email;

const StudentSchoolView: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassWithTeacher[]>([]);
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [goals, setGoals] = useState<Record<string, ClassGoal>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSummary | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const [classesRes, teachersRes] = await Promise.all([
      schoolService.getMyClassesAsStudent(user.id),
      schoolService.getMyTeachers(),
    ]);
    const cls = classesRes.data || [];
    setClasses(cls);
    if (teachersRes.data) setTeachers(teachersRes.data);

    const goalEntries = await Promise.all(
      cls.map(async (c) => [c.id, (await schoolService.getClassGoal(c.id)).data] as const)
    );
    const goalMap: Record<string, ClassGoal> = {};
    goalEntries.forEach(([id, g]) => {
      if (g) goalMap[id] = g;
    });
    setGoals(goalMap);

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh teacher door counts when doors arrive or rewards change
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`school_student_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'granted_rewards', filter: `student_id=eq.${user.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'earned_rewards', filter: `user_id=eq.${user.id}` }, () => load())
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

  if (selectedTeacher) {
    return (
      <TeacherDetailView
        teacher={selectedTeacher}
        onBack={() => {
          setSelectedTeacher(null);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }} edges={['top']}>
      <Header
        variant="section"
        iconName="school"
        title="My School"
        subtitle="Your teachers & their rewards"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* My Teachers */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={[titleStyle, { marginBottom: 0 }]}>My Teachers</Text>
          <TouchableOpacity onPress={() => setShowJoin(true)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={{ color: Colors.primary, fontWeight: '700' }}>Join class</Text>
          </TouchableOpacity>
        </View>
        {teachers.length === 0 ? (
          <View style={emptyCard}>
            <Ionicons name="people-outline" size={32} color={Colors.gray400} />
            <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>
              You're not in any classes yet. Your teacher will add you.
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 24 }}>
            {teachers.map((t) => (
              <TouchableOpacity
                key={t.teacher_id}
                onPress={() => setSelectedTeacher(t)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  ...shadow,
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 16 }}>
                    {(t.first_name?.[0] || t.email[0] || '?').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.gray900 }}>{teacherName(t)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Ionicons name="ticket-outline" size={14} color={t.door_count > 0 ? Colors.primary : Colors.gray400} />
                    <Text style={{ fontSize: 13, color: t.door_count > 0 ? Colors.primary : Colors.gray500, fontWeight: t.door_count > 0 ? '600' : '400' }}>
                      {t.door_count} {t.door_count === 1 ? 'door' : 'doors'} to spend
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Classes */}
        <Text style={titleStyle}>My Classes</Text>
        {classes.length === 0 ? (
          <View style={emptyCard}>
            <Ionicons name="school-outline" size={28} color={Colors.gray400} />
            <Text style={{ color: Colors.gray600, marginTop: 8, textAlign: 'center' }}>No classes yet.</Text>
          </View>
        ) : (
          classes.map((c) => (
            <View
              key={c.id}
              style={{
                backgroundColor: Colors.white,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                ...shadow,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="book" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.gray900 }}>{c.name}</Text>
                  <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 2 }}>{c.teacher_name}</Text>
                </View>
              </View>
              {goals[c.id] ? (
                <View style={{ marginTop: 14 }}>
                  <ClassGoalBar goal={goals[c.id]} />
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavBar />

      <JoinClassModal
        visible={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={(name) => {
          setShowJoin(false);
          load();
          Alert.alert('Joined!', `You joined "${name}".`);
        }}
      />
    </SafeAreaView>
  );
};

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

export default StudentSchoolView;
