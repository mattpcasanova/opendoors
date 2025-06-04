import { RouteProp, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MontyHallGame from '../../components/game/MontyHallGame';
import { useNavigation } from '../../hooks/useNavigation';
import { RootStackParamList } from '../../types/navigation';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen() {
  const navigation = useNavigation();
  const route = useRoute<GameScreenRouteProp>();
  
  const { prizeName = 'Free Sandwich', sponsorName = 'Chick-fil-A' } = route.params || {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <LinearGradient
        colors={['#F8F9FA', '#E8F5F4']}
        style={{ flex: 1 }}
      >
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          margin: 20,
          padding: 30,
          shadowColor: '#009688',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 30,
          flex: 1,
        }}>
          {/* Header */}
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#009688',
            textAlign: 'center',
            marginBottom: 8
          }}>
            {sponsorName}: {prizeName}
          </Text>
          
          {/* Monty Hall Game Component */}
          <MontyHallGame />
          
          {/* Back Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 20
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
              ← Back to Games
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}