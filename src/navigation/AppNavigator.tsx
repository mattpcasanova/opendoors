import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import RootNavigator from './RootNavigator';

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}