import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, View, AppState, InteractionManager } from 'react-native';
import TutorialOverlay from '../components/TutorialOverlay';
import { useAuth } from '../hooks/useAuth';
import { useTutorial } from '../hooks/useTutorial';
import { supabase } from '../services/supabase/client';
import { userPreferencesService } from '../services/userPreferencesService';
import { RootStackParamList } from '../types/navigation';

// Navigators
import SurveyScreen from '../screens/auth/SurveyScreen';
import EarnedRewardsScreen from '../screens/rewards/EarnedRewardsScreen';
import PrizeDetailsScreen from '../screens/rewards/PrizeDetailsScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// TODO: Add these when you create the screens
// import PrizeDetailsScreen from '../screens/rewards/PrizeDetailsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { showTutorial, isLoading: tutorialLoading, completeTutorial, skipTutorial } = useTutorial();
  const [surveyCompleted, setSurveyCompleted] = useState<boolean | null>(null);
  const [checkingSurvey, setCheckingSurvey] = useState(false);

  // Debug logs
  console.log('🔍 RootNavigator state:', {
    user: user?.id,
    userEmail: user?.email,
    loading,
    surveyCompleted,
    checkingSurvey,
    hasUser: !!user,
    showTutorial,
    tutorialLoading
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
      // Check immediately without delay to avoid flash
      checkSurveyStatus();
    } else {
      setSurveyCompleted(null);
    }
  }, [user?.id]);

  // Request permissions on first sign-in (after survey completion)
  useEffect(() => {
    const requestInitialPermissions = async () => {
      if (!user?.id || !surveyCompleted || showTutorial) return;

      try {
        // Check if permissions were already requested (check user_settings)
        const { data: settings } = await supabase
          .from('user_settings')
          .select('location_enabled, notifications_enabled')
          .eq('user_id', user.id)
          .single();
        
        console.log('🔍 Checking permissions for first sign-in:', {
          hasSettings: !!settings,
          locationEnabled: settings?.location_enabled,
          notificationsEnabled: settings?.notifications_enabled
        });

        // Request location permission
        const locationStatus = await Location.getForegroundPermissionsAsync();
        console.log('📍 Location permission status:', locationStatus.status);
        
        // Only request if status is 'undetermined' (first time) or if we haven't saved it yet
        if (locationStatus.status === 'undetermined' || 
            (locationStatus.status === 'granted' && settings?.location_enabled !== true)) {
          console.log('📍 Requesting location permission...');
          const { status: newLocationStatus } = await Location.requestForegroundPermissionsAsync();
          console.log('📍 Location permission result:', newLocationStatus);
          
          if (newLocationStatus === 'granted') {
            // Update user settings
            await supabase.from('user_settings').upsert(
              { user_id: user.id, location_enabled: true },
              { onConflict: 'user_id' }
            );
            // Emit event to refresh game cards with distance
            DeviceEventEmitter.emit('LOCATION_ENABLED');
            console.log('✅ Location permission granted and saved');
          } else if (newLocationStatus === 'denied') {
            // User denied, save that too
            await supabase.from('user_settings').upsert(
              { user_id: user.id, location_enabled: false },
              { onConflict: 'user_id' }
            );
            console.log('⚠️ Location permission denied');
          }
        } else if (locationStatus.status === 'granted' && settings?.location_enabled !== true) {
          // Permission already granted by system but not saved in our DB
          await supabase.from('user_settings').upsert(
            { user_id: user.id, location_enabled: true },
            { onConflict: 'user_id' }
          );
          DeviceEventEmitter.emit('LOCATION_ENABLED');
        }

        // Request push notification permission
        const notificationStatus = await Notifications.getPermissionsAsync();
        console.log('🔔 Notification permission status:', notificationStatus.status);
        
        // Only request if status is 'undetermined' (first time) or if we haven't saved it yet
        if (notificationStatus.status === 'undetermined' || 
            (notificationStatus.status === 'granted' && settings?.notifications_enabled !== true)) {
          console.log('🔔 Requesting notification permission...');
          const { status: newNotificationStatus } = await Notifications.requestPermissionsAsync();
          console.log('🔔 Notification permission result:', newNotificationStatus);
          
          if (newNotificationStatus === 'granted') {
            // Update user settings and register
            await supabase.from('user_settings').upsert(
              { user_id: user.id, notifications_enabled: true },
              { onConflict: 'user_id' }
            );
            const { pushNotificationService } = await import('../services/pushNotificationService');
            await pushNotificationService.registerForPushNotifications(user.id);
            console.log('✅ Notification permission granted and saved');
          } else if (newNotificationStatus === 'denied') {
            // User denied, save that too
            await supabase.from('user_settings').upsert(
              { user_id: user.id, notifications_enabled: false },
              { onConflict: 'user_id' }
            );
            console.log('⚠️ Notification permission denied');
          }
        } else if (notificationStatus.status === 'granted') {
          // Already granted, just register and save
          await supabase.from('user_settings').upsert(
            { user_id: user.id, notifications_enabled: true },
            { onConflict: 'user_id' }
          );
          const { pushNotificationService } = await import('../services/pushNotificationService');
          await pushNotificationService.registerForPushNotifications(user.id);
        }
      } catch (error) {
        console.error('❌ Error requesting initial permissions:', error);
      }
    };

    if (user?.id && surveyCompleted && !showTutorial) {
      // Run in background without blocking UI - use InteractionManager for better performance
      InteractionManager.runAfterInteractions(() => {
        requestInitialPermissions();
      });
    }
  }, [user?.id, surveyCompleted, showTutorial]);

  // Register for push notifications and run automatic notification checks when user is authenticated
  useEffect(() => {
    const initNotifications = async () => {
      if (user?.id && surveyCompleted && !showTutorial) {
        try {
          // Register for push notifications (will only register if permission granted)
          const { pushNotificationService } = await import('../services/pushNotificationService');
          await pushNotificationService.registerForPushNotifications(user.id);

          // Run automatic notification checks (daily reset, expiring rewards, etc.)
          const { autoNotificationService } = await import('../services/autoNotificationService');
          await autoNotificationService.checkAllNotifications(user.id);

          // Note: Door notification popups are now handled by HomeScreen
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    };

    if (user?.id && surveyCompleted && !showTutorial) {
      // Run in background without blocking UI
      InteractionManager.runAfterInteractions(() => {
        initNotifications();
      });

      // Also re-check when app comes to foreground
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          InteractionManager.runAfterInteractions(() => {
            initNotifications();
          });
        }
      });
      return () => {
        sub.remove();
      };
    }
  }, [user?.id, surveyCompleted, showTutorial]);

  // Note: Realtime door notification popups are now handled by HomeScreen

  // Handle survey completion
  const handleSurveyComplete = () => {
    console.log('🔍 Survey completed, setting surveyCompleted to true');
    setSurveyCompleted(true);
  };

  // Show loading screen while checking auth, survey status, or tutorial
  if (loading || checkingSurvey || tutorialLoading || (user && surveyCompleted === null)) {
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

  // If user is authenticated but hasn't completed survey (and we've checked), show survey
  if (surveyCompleted === false) {
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
    <>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
        <RootStack.Screen name="PrizeDetails" component={PrizeDetailsScreen} />
        <RootStack.Screen name="EarnedRewards" component={EarnedRewardsScreen} />
      </RootStack.Navigator>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />

      {/* Door Notifications are now handled by HomeScreen */}
    </>
  );
}