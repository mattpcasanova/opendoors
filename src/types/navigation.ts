export type RootStackParamList = {
  // Auth Flow
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Game Flow
  GameScreen: {
    prizeId: string;
    prizeName: string;
    sponsorName: string;
  };
  GameResult: {
    gameId: string;
    won: boolean;
    prizeName: string;
    redemptionCode?: string;
  };
  
  // Prize/Rewards
  PrizeDetails: {
    prizeId: string;
  };
  RedemptionScreen: {
    userPrizeId: string;
  };
  
  // Profile/Settings
  EditProfile: undefined;
  Notifications: undefined;
  Support: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  
  // Premium
  Subscription: undefined;
  PaymentMethod: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Rewards: undefined;
  History: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Navigation prop types for screens
import { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootNavigationProp = NavigationProp<RootStackParamList>;
export type MainTabNavigationProp = NavigationProp<MainTabParamList>;
export type AuthNavigationProp = NavigationProp<AuthStackParamList>;

// Route prop types
export type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;
export type GameResultRouteProp = RouteProp<RootStackParamList, 'GameResult'>;
export type PrizeDetailsRouteProp = RouteProp<RootStackParamList, 'PrizeDetails'>; 