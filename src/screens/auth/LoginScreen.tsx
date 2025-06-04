import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '../../navigation/types';

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <LinearGradient
        colors={['#009688', '#00796B']}
        style={{ flex: 1, padding: 24 }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 32, textAlign: 'center' }}>
            Welcome Back
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 16
            }}
            onPress={() => navigation.navigate('home')}
          >
            <Text style={{ color: '#009688', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
              Login (Coming Soon)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: 'white',
              paddingVertical: 16,
              borderRadius: 12
            }}
            onPress={() => navigation.navigate('welcome')}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
              ← Back to Welcome
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 