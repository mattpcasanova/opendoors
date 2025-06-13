import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Game: { gameType: string; gameTitle: string };
  Rewards: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Game Flow
export type GameScreenRouteProp = RouteProp<MainStackParamList, 'Game'>;