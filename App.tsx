import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { AuthStackParamList, MainStackParamList, RootStackParamList } from './src/types/navigation';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';

// Main Screens
import HistoryScreen from './src/screens/main/HistoryScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import RewardsScreen from './src/screens/main/RewardsScreen';

// Import NativeWind styles
import './global.css';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Rewards" component={RewardsScreen} />
      <MainStack.Screen name="History" component={HistoryScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
    </MainStack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner or splash while checking auth
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#009688' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white', fontSize: 24, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}