import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen } from '../navigation/AppNavigator';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function LoginScreen({ onNavigate }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
          Login Screen
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' }}>
          Authentication will go here!
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#009688',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12
          }}
          onPress={() => onNavigate('welcome')}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            ← Back to Welcome
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}