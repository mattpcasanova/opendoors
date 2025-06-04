import React, { useState } from 'react';
import GameScreen from '../screens/game/GameScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/main/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

export type Screen = 'welcome' | 'home' | 'game' | 'login';

export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen onNavigate={navigate} />;
    case 'home':
      return <HomeScreen onNavigate={navigate} />;
    case 'game':
      return <GameScreen onNavigate={navigate} />;
    case 'login':
      return <LoginScreen onNavigate={navigate} />;
    default:
      return <WelcomeScreen onNavigate={navigate} />;
  }
}
