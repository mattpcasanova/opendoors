import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthNavigation } from '../hooks/useNavigation';

export default function WelcomeScreen() {
  const navigation = useAuthNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#009688', '#00796B']}
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 32 
        }}
      >
        {/* Status Bar Mock */}
        <View style={{
          position: 'absolute',
          top: 60,
          left: 24,
          right: 24,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>9:41</Text>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>100%</Text>
        </View>

        {/* App Logo */}
        <View style={{
          width: 96,
          height: 96,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32
        }}>
          <Text style={{ fontSize: 48 }}>🚪</Text>
        </View>

        <Text style={{ 
          color: 'white', 
          fontSize: 36, 
          fontWeight: 'bold', 
          marginBottom: 16,
          textAlign: 'center'
        }}>
          OpenDoors
        </Text>
        
        <Text style={{ 
          color: '#B2DFDB', 
          fontSize: 20, 
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Win amazing rewards
        </Text>
        
        <Text style={{ 
          color: '#B2DFDB', 
          fontSize: 18, 
          marginBottom: 48,
          textAlign: 'center'
        }}>
          Play games, earn prizes from your favorite stores
        </Text>

        {/* Buttons */}
        <View style={{ width: '100%' }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 16
            }}
            onPress={() => {
              // For now, simulate login by navigating to main app
              // Later this will be proper signup flow
              console.log('Get Started - will implement signup flow');
            }}
          >
            <Text style={{ 
              color: '#009688', 
              textAlign: 'center', 
              fontSize: 18, 
              fontWeight: '600' 
            }}>
              Get Started
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: 'white',
              paddingVertical: 16,
              borderRadius: 12
            }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ 
              color: 'white', 
              textAlign: 'center', 
              fontSize: 18, 
              fontWeight: '600' 
            }}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}