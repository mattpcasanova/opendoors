import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '../../navigation/types';

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <LinearGradient
        colors={['#009688', '#00796B']}
        style={{ flex: 1, padding: 24 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
            Welcome to OpenDoors
          </Text>
          <Text style={{ fontSize: 18, color: '#B2DFDB', textAlign: 'center', marginBottom: 32 }}>
            Play games to win real prizes!
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 12,
              marginBottom: 16,
              width: '100%'
            }}
            onPress={() => navigation.navigate('home')}
          >
            <Text style={{ color: '#009688', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 