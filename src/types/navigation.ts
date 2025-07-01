import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Reward } from '../components/main/RewardCard';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Rewards: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
  Survey: undefined;
  MainTabs: undefined;
  PrizeDetails: { reward: Reward };
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = NativeStackNavigationProp<MainTabParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Game Flow
export type GameScreenRouteProp = RouteProp<RootStackParamList, 'PrizeDetails'>;