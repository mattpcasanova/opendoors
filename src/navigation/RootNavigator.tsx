import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// Game Screens
import GameScreen from '../screens/game/GameScreen';

// TODO: Add these when you create the screens
// import PrizeDetailsScreen from '../screens/rewards/PrizeDetailsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // For now, we'll use simple state to simulate auth
  // Later this will connect to Supabase auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking auth state
  useEffect(() => {
    // Simulate auth check delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      // For now, start unauthenticated
      setIsAuthenticated(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#009688' 
      }}>
        <View style={{
          width: 96,
          height: 96,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}>
          <Text style={{ fontSize: 48 }}>🚪</Text>
        </View>
        <ActivityIndicator size="large" color="white" />
        <Text style={{
          color: 'white',
          fontSize: 18,
          marginTop: 16,
          fontWeight: '600'
        }}>
          Loading OpenDoors...
        </Text>
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
      {isAuthenticated ? (
        // Authenticated screens
        <>
          <RootStack.Screen 
            name="MainStack" 
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
          
          {/* Add these when you create the screens */}
          {/* <RootStack.Screen name="PrizeDetails" component={PrizeDetailsScreen} /> */}
        </>
      ) : (
        // Unauthenticated screens
        <RootStack.Screen 
          name="AuthStack" 
          component={AuthNavigator}
          options={{
            animation: 'fade',
          }}
        />
      )}
    </RootStack.Navigator>
  );
}