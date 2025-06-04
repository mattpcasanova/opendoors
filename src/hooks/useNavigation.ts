import { useNavigation as useRNNavigation } from '@react-navigation/native';
import { AuthNavigationProp, MainTabNavigationProp, RootNavigationProp } from '../types/navigation';

export const useNavigation = () => useRNNavigation<RootNavigationProp>();
export const useAuthNavigation = () => useRNNavigation<AuthNavigationProp>();
export const useMainNavigation = () => useRNNavigation<MainTabNavigationProp>();