import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameCard from '../../components/game/GameCard';
import { Screen } from '../../navigation/AppNavigator';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function HomeScreen({ onNavigate }: Props) {
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
          onPress={() => onNavigate('game')}
        />

        <TouchableOpacity
          style={{
            backgroundColor: '#009688',
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 20
          }}
          onPress={() => onNavigate('welcome')}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
            ← Back to Welcome
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
