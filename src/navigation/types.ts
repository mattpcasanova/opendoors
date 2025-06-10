import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
};

export type NavigationProp = NativeStackNavigationProp<AuthStackParamList>; 