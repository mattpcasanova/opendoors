import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';

export function useAuthNavigation() {
  return useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
}