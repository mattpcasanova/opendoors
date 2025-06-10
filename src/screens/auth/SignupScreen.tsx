import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
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

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signUp({
      email: formData.email.trim(),
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Welcome')
          }
        ]
      );
    }
    setLoading(false);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
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
            <View className="px-6 pt-5 pb-8">
              {/* Back Button */}
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="mb-6 self-start p-3 -ml-3 rounded-full bg-white/10"
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
              <View className="items-center mb-4">
                {/* App Logo */}
                <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-6 shadow-lg">
                  <Text className="text-4xl">🚪</Text>
                </View>

                <Text className="text-white text-3xl font-black text-center mb-2 tracking-tight">
                  Join Open Doors!
                </Text>
                
                <Text className="text-teal-50 text-lg text-center font-medium opacity-90">
                  Create your account to start winning
                </Text>
              </View>
            </View>

            {/* Signup Form Container */}
            <View className="flex-1 px-6">
              <View className="bg-white rounded-t-3xl px-8 pt-10 pb-8 flex-1 min-h-[600px] shadow-2xl">
                
                {/* Form Title */}
                <Text className="text-2xl font-black text-gray-900 text-center mb-8 tracking-tight">
                  Create Account
                </Text>

                {/* Name Fields Row */}
                <View className="flex-row gap-3 mb-6">
                  {/* First Name */}
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">
                      First Name
                    </Text>
                    <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-4 shadow-sm">
                      <Ionicons name="person-outline" size={18} color="#009688" />
                      <TextInput
                        className="flex-1 py-4 text-base text-gray-900 ml-3 font-medium"
                        placeholder="First name"
                        placeholderTextColor="#9CA3AF"
                        value={formData.firstName}
                        onChangeText={(text) => updateField('firstName', text)}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Last Name */}
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">
                      Last Name
                    </Text>
                    <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-4 shadow-sm">
                      <Ionicons name="person-outline" size={18} color="#009688" />
                      <TextInput
                        className="flex-1 py-4 text-base text-gray-900 ml-3 font-medium"
                        placeholder="Last name"
                        placeholderTextColor="#9CA3AF"
                        value={formData.lastName}
                        onChangeText={(text) => updateField('lastName', text)}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                  </View>
                </View>

                {/* Email Input */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">
                    Email Address
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-5 shadow-sm">
                    <Ionicons name="mail-outline" size={20} color="#009688" />
                    <TextInput
                      className="flex-1 py-5 text-base text-gray-900 ml-3 font-medium"
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={formData.email}
                      onChangeText={(text) => updateField('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">
                    Password
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-5 shadow-sm">
                    <Ionicons name="lock-closed-outline" size={20} color="#009688" />
                    <TextInput
                      className="flex-1 py-5 text-base text-gray-900 ml-3 font-medium"
                      placeholder="Create a password"
                      placeholderTextColor="#9CA3AF"
                      value={formData.password}
                      onChangeText={(text) => updateField('password', text)}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      returnKeyType="next"
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

                {/* Confirm Password Input */}
                <View className="mb-8">
                  <Text className="text-xs font-bold text-gray-900 mb-2 tracking-wide uppercase">
                    Confirm Password
                  </Text>
                  <View className="bg-gray-50 border-2 border-gray-100 rounded-2xl flex-row items-center px-5 shadow-sm">
                    <Ionicons name="lock-closed-outline" size={20} color="#009688" />
                    <TextInput
                      className="flex-1 py-5 text-base text-gray-900 ml-3 font-medium"
                      placeholder="Confirm your password"
                      placeholderTextColor="#9CA3AF"
                      value={formData.confirmPassword}
                      onChangeText={(text) => updateField('confirmPassword', text)}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={handleSignup}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-2 rounded-full"
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                  className={`mb-6 bg-teal-600 py-6 rounded-2xl shadow-lg ${loading ? 'opacity-70' : 'opacity-100'}`}
                  onPress={handleSignup}
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
                    {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-0.5 bg-gray-200" />
                  <Text className="mx-6 text-gray-400 text-sm font-semibold tracking-wider uppercase">
                    or
                  </Text>
                  <View className="flex-1 h-0.5 bg-gray-200" />
                </View>

                {/* Social Login Buttons */}
                <View className="gap-3 mb-8">
                  {/* Google Sign Up */}
                  <TouchableOpacity 
                    className="bg-white border-2 border-gray-100 py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
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
                      Sign up with Google
                    </Text>
                  </TouchableOpacity>

                  {/* Apple Sign Up */}
                  <TouchableOpacity 
                    className="bg-black py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
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
                      Sign up with Apple
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text className="text-xs text-gray-500 text-center mb-6 leading-4">
                  By creating an account, you agree to our{' '}
                  <Text className="text-teal-600 font-semibold">Terms of Service</Text>
                  {' '}and{' '}
                  <Text className="text-teal-600 font-semibold">Privacy Policy</Text>
                </Text>

                {/* Login Link */}
                <View className="flex-row justify-center items-center py-5 bg-gray-50 rounded-2xl mt-auto border border-gray-100">
                  <Text className="text-gray-600 text-base font-medium">
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                    className="py-1 px-2 rounded-lg"
                  >
                    <Text className="text-teal-600 text-base font-black tracking-wide">
                      Sign in
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