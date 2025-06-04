import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RewardsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">My Rewards</Text>
        <Text className="text-gray-600">Your won prizes will appear here.</Text>
      </ScrollView>
    </SafeAreaView>
  );
} 