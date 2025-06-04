import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import React from 'react';
import RootNavigator from './RootNavigator';

export default function NavigationContainer() {
  return (
    <RNNavigationContainer>
      <RootNavigator />
    </RNNavigationContainer>
  );
} 