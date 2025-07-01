import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { userPreferencesService } from '../services/userPreferencesService';
import { RootStackParamList } from '../types/navigation';

// Navigators
import SurveyScreen from '../screens/auth/SurveyScreen';
import PrizeDetailsScreen from '../screens/rewards/PrizeDetailsScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// TODO: Add these when you create the screens
// import PrizeDetailsScreen from '../screens/rewards/PrizeDetailsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [surveyCompleted, setSurveyCompleted] = useState<boolean | null>(null);
  const [checkingSurvey, setCheckingSurvey] = useState(false);

  // Debug logs
  console.log('🔍 RootNavigator state:', {
    user: user?.id,
    userEmail: user?.email,
    loading,
    surveyCompleted,
    checkingSurvey,
    hasUser: !!user
  });

  useEffect(() => {
    const checkSurveyStatus = async () => {
      console.log('🔍 checkSurveyStatus called with user:', user?.id);
      if (!user?.id) {
        console.log('🔍 No user ID, setting surveyCompleted to null');
        setSurveyCompleted(null);
        return;
      }
      setCheckingSurvey(true);
      try {
        console.log('🔍 Checking survey status for user:', user.id);
        const completed = await userPreferencesService.hasCompletedSurvey(user.id);
        console.log('🔍 Survey completion result:', completed);
        setSurveyCompleted(completed);
      } catch (error) {
        console.error('❌ Error checking survey status:', error);
        setSurveyCompleted(false); // Default to showing survey if error
      } finally {
        setCheckingSurvey(false);
      }
    };
    if (user?.id) {
      const timer = setTimeout(checkSurveyStatus, 100);
      return () => clearTimeout(timer);
    } else {
      setSurveyCompleted(null);
    }
  }, [user?.id]);

  // Handle survey completion
  const handleSurveyComplete = () => {
    console.log('🔍 Survey completed, setting surveyCompleted to true');
    setSurveyCompleted(true);
  };

  if (loading || checkingSurvey) {
    console.log('🔍 Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#009688" />
      </View>
    );
  }

  // If user is not authenticated, show auth flow
  if (!user) {
    console.log('🔍 No user, showing AuthNavigator (includes Welcome screen)');
    return <AuthNavigator />;
  }

  // If user is authenticated but hasn't completed survey, show survey in a stack
  if (!surveyCompleted) {
    console.log('🔍 User authenticated but survey not completed, showing SurveyScreen');
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Survey">
          {() => <SurveyScreen onComplete={handleSurveyComplete} />}
        </RootStack.Screen>
      </RootStack.Navigator>
    );
  }

  // If user is authenticated and has completed survey, show main app
  console.log('🔍 User authenticated and survey completed, showing MainTabNavigator and other screens');
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      <RootStack.Screen name="PrizeDetails" component={PrizeDetailsScreen} />
    </RootStack.Navigator>
  );
}