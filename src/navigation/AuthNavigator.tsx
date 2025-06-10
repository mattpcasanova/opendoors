import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AuthStackParamList } from '../types/navigation';

// Import your auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: 'transparent' },
        animationDuration: 200,
        presentation: 'card',
        fullScreenGestureEnabled: true,
      }}
    >
      <AuthStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <AuthStack.Screen 
        name="Signup" 
        component={SignupScreen}
      />
      {/* <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
    </AuthStack.Navigator>
  );
}