import { useNavigation as useRNNavigation } from '@react-navigation/native';
import { MainTabNavigationProp, RootNavigationProp } from '../types/navigation';

export const useNavigation = () => useRNNavigation<RootNavigationProp>();
export const useTabNavigation = () => useRNNavigation<MainTabNavigationProp>(); 