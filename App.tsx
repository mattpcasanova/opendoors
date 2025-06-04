import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NavigationContainer from './src/navigation/NavigationContainer';

// Import your global CSS for NativeWind
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
} 