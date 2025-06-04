import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  welcome: undefined;
  home: undefined;
  game: undefined;
  login: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 