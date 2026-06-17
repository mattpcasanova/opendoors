import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StudentSchoolView from '../../components/school/StudentSchoolView';
import TeacherSchoolView from '../../components/school/TeacherSchoolView';
import { LoadingSpinner } from '../../components/ui';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfileWithRetry } from '../../utils/supabaseHelpers';

const SchoolScreen: React.FC = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadRole = async () => {
      if (!user?.id) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const { data: profile } = await getUserProfileWithRetry(user.id);
        if (mounted) setUserType(profile?.user_type || 'user');
      } catch {
        if (mounted) setUserType('user');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadRole();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" color={Colors.primary} />
        <View />
      </SafeAreaView>
    );
  }

  return userType === 'teacher' ? <TeacherSchoolView /> : <StudentSchoolView />;
};

export default SchoolScreen;
