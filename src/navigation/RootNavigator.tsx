import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../types/navigation';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// Game Screens
import GameResultScreen from '../screens/game/GameResultScreen';
import GameScreen from '../screens/game/GameScreen';

// Prize/Reward Screens
import PrizeDetailsScreen from '../screens/rewards/PrizeDetailsScreen';
import RedemptionScreen from '../screens/rewards/RedemptionScreen';

// Profile/Settings Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';

// Premium Screens
import PaymentMethodScreen from '../screens/premium/PaymentMethodScreen';
import SubscriptionScreen from '../screens/premium/SubscriptionScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-teal-600">
        <ActivityIndicator size="large" color="white" />
        <View className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-8 mt-8">
          <Text className="text-4xl">🚪</Text>
        </View>
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      {session ? (
        // Authenticated screens
        <>
          <RootStack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
            options={{
              animation: 'fade',
            }}
          />
          
          {/* Game Flow */}
          <RootStack.Screen 
            name="GameScreen" 
            component={GameScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <RootStack.Screen 
            name="GameResult" 
            component={GameResultScreen}
            options={{
              animation: 'fade',
              gestureEnabled: false, // Prevent dismissal
            }}
          />
          
          {/* Prize/Rewards Flow */}
          <RootStack.Screen 
            name="PrizeDetails" 
            component={PrizeDetailsScreen}
          />
          <RootStack.Screen 
            name="RedemptionScreen" 
            component={RedemptionScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          
          {/* Profile/Settings Flow */}
          <RootStack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
          />
          <RootStack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
          />
          <RootStack.Screen 
            name="Support" 
            component={SupportScreen}
          />
          <RootStack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
          />
          <RootStack.Screen 
            name="TermsOfService" 
            component={TermsOfServiceScreen}
          />
          
          {/* Premium Flow */}
          <RootStack.Screen 
            name="Subscription" 
            component={SubscriptionScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <RootStack.Screen 
            name="PaymentMethod" 
            component={PaymentMethodScreen}
          />
        </>
      ) : (
        // Unauthenticated screens
        <RootStack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animation: 'fade',
          }}
        />
      )}
    </RootStack.Navigator>
  );
} 