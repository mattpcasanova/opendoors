import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Profile</Text>
        
        <TouchableOpacity
          className="bg-red-600 px-6 py-3 rounded-xl mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 