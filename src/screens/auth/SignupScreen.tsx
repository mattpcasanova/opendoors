import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../../hooks/useNavigation';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
      
      Alert.alert('Success', 'Account created successfully!');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-4"
          >
            <ArrowLeft size={24} color="#666" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-800">Create account</Text>
            <Text className="text-gray-600 mt-1">Join and start winning rewards</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-6 py-8">
        {/* Name Fields */}
        <View className="flex-row space-x-3 mb-6">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">First name</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4"
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">Last name</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4"
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* Email */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Email address</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center">
            <Mail size={20} color="#999" className="mr-3" />
            <TextInput
              className="flex-1 text-base"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center">
            <Lock size={20} color="#999" className="mr-3" />
            <TextInput
              className="flex-1 text-base"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#999" />
              ) : (
                <Eye size={20} color="#999" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          className="bg-teal-600 py-4 rounded-xl mb-4"
          onPress={handleSignup}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-teal-600 font-semibold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 