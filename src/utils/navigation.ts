import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigateToGame = (
  navigation: NavigationProp<RootStackParamList>,
  prizeId: string,
  prizeName: string,
  sponsorName: string
) => {
  navigation.navigate('GameScreen', {
    prizeId,
    prizeName,
    sponsorName,
  });
};

export const navigateToGameResult = (
  navigation: NavigationProp<RootStackParamList>,
  gameId: string,
  won: boolean,
  prizeName: string,
  redemptionCode?: string
) => {
  navigation.navigate('GameResult', {
    gameId,
    won,
    prizeName,
    redemptionCode,
  });
};

export const navigateToPrizeDetails = (
  navigation: NavigationProp<RootStackParamList>,
  prizeId: string
) => {
  navigation.navigate('PrizeDetails', { prizeId });
}; 