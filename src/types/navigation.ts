export type RootStackParamList = {
  // Auth Flow
  AuthStack: undefined;
  
  // Main App Flow  
  MainStack: undefined;
  
  // Game Flow
  GameScreen: {
    prizeId?: string;
    prizeName?: string;
    sponsorName?: string;
  };
  
  // Modal Screens
  PrizeDetails: {
    prizeId: string;
  };
};

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

// Navigation prop types
import { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootNavigationProp = NavigationProp<RootStackParamList>;
export type AuthNavigationProp = NavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = NavigationProp<MainTabParamList>;

// Route prop types
export type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;
export type PrizeDetailsRouteProp = RouteProp<RootStackParamList, 'PrizeDetails'>;