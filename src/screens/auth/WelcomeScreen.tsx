import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../../hooks/useNavigation';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#009688', '#00796B']}
        className="flex-1 justify-center items-center px-8"
      >
        {/* Status Bar Mock */}
        <View className="absolute top-12 left-6 right-6 flex-row justify-between">
          <Text className="text-white text-sm font-semibold">9:41</Text>
          <Text className="text-white text-sm font-semibold">100%</Text>
        </View>

        {/* App Logo */}
        <View className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl items-center justify-center mb-8">
          <Text className="text-4xl">🚪</Text>
        </View>

        <Text className="text-white text-4xl font-bold mb-4 text-center">OpenDoors</Text>
        <Text className="text-teal-100 text-xl mb-2 text-center">Win amazing rewards</Text>
        <Text className="text-teal-200 text-lg mb-12 text-center">
          Play games, earn prizes from your favorite stores
        </Text>

        {/* Features */}
        <View className="space-y-4 mb-12 w-full max-w-sm">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4">
              <Text className="text-lg">🎯</Text>
            </View>
            <Text className="text-teal-100">Play games at local businesses</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4">
              <Text className="text-lg">🎁</Text>
            </View>
            <Text className="text-teal-100">Win real rewards and discounts</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4">
              <Text className="text-lg">📍</Text>
            </View>
            <Text className="text-teal-100">Discover games near you</Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            className="bg-white py-4 rounded-xl"
            onPress={() => navigation.navigate('Signup')}
          >
            <Text className="text-teal-600 text-center text-lg font-semibold">Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="border-2 border-white py-4 rounded-xl"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white text-center text-lg font-semibold">I already have an account</Text>
          </TouchableOpacity>
        </View>

        {/* Home Indicator */}
        <View className="absolute bottom-2 w-20 h-1 bg-white bg-opacity-30 rounded-full" />
      </LinearGradient>
    </SafeAreaView>
  );
} 