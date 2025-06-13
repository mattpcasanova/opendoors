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

  const handleSignup = async () => {
    // Defensive extraction from form data
    const firstNameValue = formData?.firstName;
    const lastNameValue = formData?.lastName;
    const emailValue = formData?.email;
    const passwordValue = formData?.password;
    const confirmPasswordValue = formData?.confirmPassword;
    
    if (firstNameValue === undefined || firstNameValue === null || firstNameValue === '') {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    
    if (lastNameValue === undefined || lastNameValue === null || lastNameValue === '') {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    
    if (emailValue === undefined || emailValue === null || emailValue === '') {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    if (passwordValue === undefined || passwordValue === null || passwordValue === '') {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (confirmPasswordValue === undefined || confirmPasswordValue === null || confirmPasswordValue === '') {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    const firstName = String(firstNameValue).trim();
    const lastName = String(lastNameValue).trim();
    const email = String(emailValue).trim();
    const password = String(passwordValue);
    const confirmPassword = String(confirmPasswordValue);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const result = await signUp({
        firstName,
        lastName,
        email,
        password,
      });

      if (result.error) {
        let errorMessage = 'An error occurred during sign up';
        
        if (result.error.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
        
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFirstName = (text: string) => {
    setFormData(prev => ({ ...prev, firstName: text }));
  };

  const updateLastName = (text: string) => {
    setFormData(prev => ({ ...prev, lastName: text }));
  };

  const updateEmail = (text: string) => {
    setFormData(prev => ({ ...prev, email: text }));
  };

  const updatePassword = (text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
  };

  const updateConfirmPassword = (text: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: text }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#009688' }}>
      <LinearGradient
        colors={['#009688', '#00796B']}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Header Section */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}>
              {/* Back Button */}
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{
                  marginBottom: 32,
                  alignSelf: 'flex-start',
                  padding: 12,
                  marginLeft: -12,
                  borderRadius: 9999,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              {/* Header Content */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                {/* App Logo */}
                <View style={{
                  width: 96,
                  height: 96,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                  <Text style={{ fontSize: 48 }}>🚪</Text>
                </View>

                <Text style={{
                  color: 'white',
                  fontSize: 36,
                  fontWeight: '900',
                  textAlign: 'center',
                  marginBottom: 12,
                  letterSpacing: -0.5,
                }}>
                  Join OpenDoors
                </Text>
                
                <Text style={{
                  color: '#E0F2F1',
                  fontSize: 20,
                  textAlign: 'center',
                  fontWeight: '500',
                  opacity: 0.9,
                }}>
                  Create an account to start winning
                </Text>
              </View>
            </View>

            {/* Signup Form Container */}
            <View style={{ flex: 1, paddingHorizontal: 24 }}>
              <View style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 32,
                paddingTop: 48,
                paddingBottom: 40,
                flex: 1,
                minHeight: 500,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 8,
              }}>
                
                {/* Form Title */}
                <Text style={{
                  fontSize: 30,
                  fontWeight: '900',
                  color: '#111827',
                  textAlign: 'center',
                  marginBottom: 40,
                  letterSpacing: -0.5,
                }}>
                  Sign Up
                </Text>

                {/* Name Fields Row */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
                  {/* First Name */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: 12,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}>
                      First Name
                    </Text>
                    <View style={{
                      backgroundColor: '#F9FAFB',
                      borderWidth: 2,
                      borderColor: '#F3F4F6',
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}>
                      <MaterialIcons name="person" size={22} color="#009688" style={{ marginRight: 16 }} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingVertical: 20,
                          fontSize: 16,
                          color: '#111827',
                          marginLeft: 16,
                          fontWeight: '500',
                        }}
                        placeholder="First name"
                        placeholderTextColor="#9CA3AF"
                        value={formData.firstName}
                        onChangeText={updateFirstName}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Last Name */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: 12,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}>
                      Last Name
                    </Text>
                    <View style={{
                      backgroundColor: '#F9FAFB',
                      borderWidth: 2,
                      borderColor: '#F3F4F6',
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}>
                      <MaterialIcons name="person" size={22} color="#009688" style={{ marginRight: 16 }} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingVertical: 20,
                          fontSize: 16,
                          color: '#111827',
                          marginLeft: 16,
                          fontWeight: '500',
                        }}
                        placeholder="Last name"
                        placeholderTextColor="#9CA3AF"
                        value={formData.lastName}
                        onChangeText={updateLastName}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                  </View>
                </View>

                {/* Email Input */}
                <View style={{ marginBottom: 28 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: 12,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    Email Address
                  </Text>
                  <View style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 2,
                    borderColor: '#F3F4F6',
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <MaterialIcons name="email" size={22} color="#009688" style={{ marginRight: 16 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 20,
                        fontSize: 16,
                        color: '#111827',
                        marginLeft: 16,
                        fontWeight: '500',
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={formData.email}
                      onChangeText={updateEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 28 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: 12,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    Password
                  </Text>
                  <View style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 2,
                    borderColor: '#F3F4F6',
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <MaterialIcons name="lock" size={22} color="#009688" style={{ marginRight: 16 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 20,
                        fontSize: 16,
                        color: '#111827',
                        marginLeft: 16,
                        fontWeight: '500',
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={formData.password}
                      onChangeText={updatePassword}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      returnKeyType="next"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={{
                        padding: 8,
                        borderRadius: 9999,
                      }}
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
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: 12,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    Confirm Password
                  </Text>
                  <View style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 2,
                    borderColor: '#F3F4F6',
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <MaterialIcons name="lock" size={22} color="#009688" style={{ marginRight: 16 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 20,
                        fontSize: 16,
                        color: '#111827',
                        marginLeft: 16,
                        fontWeight: '500',
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9CA3AF"
                      value={formData.confirmPassword}
                      onChangeText={updateConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={handleSignup}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        padding: 8,
                        borderRadius: 9999,
                      }}
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

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={{
                    marginBottom: 32,
                    backgroundColor: '#009688',
                    paddingVertical: 24,
                    borderRadius: 16,
                    shadowColor: '#009688',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 6,
                    opacity: loading ? 0.7 : 1,
                  }}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={{
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: '900',
                    letterSpacing: 0.5,
                  }}>
                    {loading ? 'SIGNING UP...' : 'SIGN UP'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 32,
                }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                  <Text style={{
                    marginHorizontal: 24,
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontWeight: '600',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                    or
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                </View>

                {/* Social Sign Up Buttons */}
                <View style={{ gap: 16, marginBottom: 40 }}>
                  {/* Google Sign Up */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      paddingVertical: 16,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: '#E5E7EB',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20 }}>🔍</Text>
                    <Text style={{
                      marginLeft: 12,
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#374151',
                    }}>
                      Continue with Google
                    </Text>
                  </TouchableOpacity>

                  {/* Apple Sign Up */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'black',
                      paddingVertical: 16,
                      borderRadius: 16,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20 }}>🍎</Text>
                    <Text style={{
                      marginLeft: 12,
                      fontSize: 16,
                      fontWeight: '600',
                      color: 'white',
                    }}>
                      Continue with Apple
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Link */}
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <Text style={{
                    color: '#6B7280',
                    fontSize: 16,
                  }}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: '#009688',
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      Sign in
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}