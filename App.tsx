import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import { AuthProvider } from './src/hooks/useAuth';
import RootNavigator from './src/navigation/RootNavigator';

console.log('!!! APP ENTRY !!!');

// Deep linking configuration
const linking = {
  prefixes: [
    'opendoors://',
    'https://opendoors.app',
    'https://*.opendoors.app',
  ],
  config: {
    screens: {
      // Auth screens (when user is not logged in)
      Welcome: 'welcome',
      Login: 'login',
      Signup: {
        path: 'signup',
        parse: {
          ref: (ref: string) => ref,
        },
      },
      // Main app screens (when user is logged in)
      MainTabs: {
        path: '',
        screens: {
          Home: 'home',
          Rewards: 'rewards',
          Profile: 'profile',
        },
      },
      PrizeDetails: 'prize/:id',
      EarnedRewards: 'earned-rewards',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}