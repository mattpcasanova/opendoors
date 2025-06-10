import { useNavigation as useReactNavigation } from '@react-navigation/native';
import { AuthNavigationProp, MainNavigationProp } from '../types/navigation';

export function useAuthNavigation() {
  return useReactNavigation<AuthNavigationProp>();
}

export function useMainNavigation() {
  return useReactNavigation<MainNavigationProp>();
}