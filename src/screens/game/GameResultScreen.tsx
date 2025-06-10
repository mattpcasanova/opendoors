import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../../hooks/useNavigation';

export default function GameResultScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">🏆 Game Result</Text>
        <Text className="text-gray-600 mb-6 text-center">
          Win/loss results will show here!
        </Text>
        <TouchableOpacity
          className="bg-teal-600 px-6 py-3 rounded-xl"
          onPress={() => navigation.navigate('MainStack')}
        >
          <Text className="text-white font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
