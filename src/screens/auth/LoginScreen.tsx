import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(formData.email.trim(), formData.password);

    if (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-600">
      <LinearGradient
        colors={['#009688', '#00796B']}
        className="flex-1"
      >
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Header Section */}
            <View className="px-6 pt-5 pb-10">
              {/* Back Button */}
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="mb-8 self-start p-3 -ml-3 rounded-full bg-white/10"
                activeOpacity={0.7}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              {/* Header Content */}
              <View className="items-center mb-5">
                {/* App Logo */}
                <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-8 shadow-lg">
                  <Text className="text-5xl">🚪</Text>
                </View>

                <Text className="text-white text-4xl font-black text-center mb-3 tracking-tight">
                  Welcome back!
                </Text>
                
                <Text className="text-teal-50 text-xl text-center font-medium opacity-90">
                  Sign in to continue winning
                </Text>
              </View>
            </View>

            {/* Login Form Container */}
            <View className="flex-1 px-6">
              <View className="bg-white rounded-t-3xl px-8 pt-12 pb-10 flex-1 min-h-[500px] shadow-2xl">
                
                {/* Form Title */}
                <Text className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">
                  Sign In
                </Text>

                {/* Email Input */}
                <View className="mb-7">
                  <Text className="text-sm font-bold text-gray-900 mb-3 tracking-wide uppercase">
                    Email Address
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-5 shadow-sm">
                    <MaterialIcons name="email" size={22} color="#009688" className="mr-4" />
                    <TextInput
                      className="flex-1 py-5 text-base text-gray-900 ml-4 font-medium"
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-5">
                  <Text className="text-sm font-bold text-gray-900 mb-3 tracking-wide uppercase">
                    Password
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-5 shadow-sm">
                    <MaterialIcons name="lock" size={22} color="#009688" className="mr-4" />
                    <TextInput
                      className="flex-1 py-5 text-base text-gray-900 ml-4 font-medium"
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={formData.password}
                      onChangeText={(text) => setFormData({ ...formData, password: text })}
                      secureTextEntry={!showPassword}
                      autoComplete="current-password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-full"
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity 
                  className="self-end mb-10 py-2 px-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-teal-600 text-sm font-bold tracking-wide">
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  className={`mb-8 bg-teal-600 py-6 rounded-2xl shadow-lg ${loading ? 'opacity-70' : 'opacity-100'}`}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={{
                    shadowColor: '#009688',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-center text-lg font-black tracking-wide">
                    {loading ? 'SIGNING IN...' : 'SIGN IN'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-8">
                  <View className="flex-1 h-0.5 bg-gray-200" />
                  <Text className="mx-6 text-gray-400 text-sm font-semibold tracking-wider uppercase">
                    or
                  </Text>
                  <View className="flex-1 h-0.5 bg-gray-200" />
                </View>

                {/* Social Login Buttons */}
                <View className="gap-4 mb-10">
                  {/* Google Sign In */}
                  <TouchableOpacity 
                    className="bg-white border-2 border-gray-100 py-5 rounded-2xl flex-row items-center justify-center shadow-sm"
                    activeOpacity={0.8}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="logo-google" size={20} color="#4285F4" />
                    <Text className="text-gray-900 text-base font-bold tracking-wide ml-3">
                      Continue with Google
                    </Text>
                  </TouchableOpacity>

                  {/* Apple Sign In */}
                  <TouchableOpacity 
                    className="bg-black py-5 rounded-2xl flex-row items-center justify-center shadow-lg"
                    activeOpacity={0.8}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="logo-apple" size={20} color="white" />
                    <Text className="text-white text-base font-bold tracking-wide ml-3">
                      Continue with Apple
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View className="flex-row justify-center items-center py-6 bg-gray-50 rounded-2xl mt-auto border border-gray-100">
                  <Text className="text-gray-600 text-base font-medium">
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Signup')}
                    activeOpacity={0.7}
                    className="py-1 px-2 rounded-lg"
                  >
                    <Text className="text-teal-600 text-base font-black tracking-wide">
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>

            {/* Bottom padding for keyboard */}
            <View className="h-6" />

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}