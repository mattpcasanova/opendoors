import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameCard from '../../components/game/GameCard';
import { useNavigation } from '../../hooks/useNavigation';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleGamePress = () => {
    navigation.navigate('GameScreen', {
      prizeId: 'chick-fil-a-1',
      prizeName: 'Free Chicken Sandwich',
      sponsorName: 'Chick-fil-A'
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <LinearGradient
        colors={['#009688', '#00796B']}
        style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>9:41</Text>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>100%</Text>
        </View>
        
        <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
          Good morning!
        </Text>
        <Text style={{ color: '#B2DFDB', fontSize: 18 }}>
          Ready to open some doors?
        </Text>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 16 }}>
          Available games
        </Text>
        
        <GameCard
          icon="🐔"
          title="Chick-fil-A"
          description="Free sandwich or milkshake"
          onPress={handleGamePress}
        />

        {/* Demo button to show tab navigation */}
        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#E8F5F4', borderRadius: 12 }}>
          <Text style={{ fontSize: 14, color: '#00796B', textAlign: 'center', marginBottom: 8 }}>
            🎉 React Navigation is working!
          </Text>
          <Text style={{ fontSize: 12, color: '#00796B', textAlign: 'center' }}>
            Try the tabs below and game navigation above
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}