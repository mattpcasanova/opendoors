import { useNavigation as useRNNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '../types/navigation';

export const useNavigation = () => useRNNavigation<RootNavigationProp>(); 