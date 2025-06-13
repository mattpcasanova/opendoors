import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>📊 History</Text>
        <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Coming soon!</Text>
      </View>
    </SafeAreaView>
  );
} 