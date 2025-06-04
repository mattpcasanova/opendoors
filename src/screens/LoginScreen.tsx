import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthNavigation } from '../hooks/useNavigation';

export default function LoginScreen() {
  const navigation = useAuthNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
          Login Screen
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' }}>
          Authentication will go here! For now, this just shows React Navigation working.
        </Text>
        
        <View style={{ width: '100%', gap: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12
            }}
            onPress={() => {
              // For demo purposes - simulate successful login
              console.log('Login successful - will integrate with Supabase auth later');
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Sign In (Demo)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#009688'
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#009688', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              ← Back to Welcome
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}