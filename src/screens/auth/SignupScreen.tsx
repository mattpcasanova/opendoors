import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Eye, EyeOff, Gift, Heart, Lock, Mail, Trophy, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

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

  // Animation setup for logo lift
  const logoLiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoLiftAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(logoLiftAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const logoLift = logoLiftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

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
      console.log('🔍 Starting signup process...');
      const result = await signUp({
        firstName,
        lastName,
        email,
        password,
      });

      console.log('🔍 Signup result:', { 
        success: !result.error, 
        error: result.error?.message 
      });

      if (result.error) {
        let errorMessage = 'An error occurred during sign up';
        
        if (result.error.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
        
        Alert.alert('Error', errorMessage);
      } else {
        console.log('✅ Signup successful, letting RootNavigator handle flow');
        // Do not navigate or reset navigation here. RootNavigator will handle the flow based on auth state.
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
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
    <LinearGradient
      colors={['#14B8A6', '#0D9488', '#059669']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decorative elements */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.blurCircle, styles.blurCircle1]} />
        <View style={[styles.blurCircle, styles.blurCircle2]} />
        <View style={[styles.blurCircle, styles.blurCircle3]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Enhanced Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity 
                  onPress={() => navigation.goBack()} 
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerSpacer} />
              </View>

              {/* Enhanced Logo Section */}
              <View style={styles.logoContainer}>
                <Animated.View 
                  style={[
                    styles.logoWrapper,
                    { transform: [{ translateY: logoLift }] }
                  ]}
                >
                  <View style={styles.logoGlowContainer}>
                    <Image 
                      source={require('../../../assets/OpenDoorsLogo.png')} 
                      style={styles.logoImage}
                    />
                  </View>
                </Animated.View>
              </View>

              {/* Enhanced Title Section */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  Join <Text style={styles.titleAccent}>OpenDoors</Text>
                </Text>
                <View style={styles.titleUnderline} />
                <Text style={styles.subtitle}>
                  Create an account to start winning
                </Text>
              </View>

              {/* Feature Highlights */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Gift size={24} color="white" />
                  </View>
                  <Text style={styles.featureText}>Daily prizes</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Trophy size={24} color="white" />
                  </View>
                  <Text style={styles.featureText}>Win rewards</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Heart size={24} color="white" />
                  </View>
                  <Text style={styles.featureText}>Free to play</Text>
                </View>
              </View>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <View style={styles.formCard}>
                {/* Form Fields */}
                <View style={styles.formFields}>
                  {/* Name Fields */}
                  <View style={styles.nameFieldsRow}>
                    <View style={styles.nameField}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <User size={20} color="#14B8A6" />
                        </View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="First name"
                          placeholderTextColor="#9CA3AF"
                          value={formData.firstName}
                          onChangeText={updateFirstName}
                          autoCapitalize="words"
                          returnKeyType="next"
                        />
                      </View>
                    </View>

                    <View style={styles.nameField}>
                      <Text style={styles.inputLabel}>Last Name</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <User size={20} color="#14B8A6" />
                        </View>
                        <TextInput
                          style={styles.textInput}
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

                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Mail size={20} color="#14B8A6" />
                      </View>
                      <TextInput
                        style={styles.textInput}
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

                  {/* Password Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Lock size={20} color="#14B8A6" />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Create a password"
                        placeholderTextColor="#9CA3AF"
                        value={formData.password}
                        onChangeText={updatePassword}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                        returnKeyType="next"
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Lock size={20} color="#14B8A6" />
                      </View>
                      <TextInput
                        style={styles.textInput}
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
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        {showConfirmPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                  style={[styles.createAccountButton, { opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.createAccountButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                  {!loading && <ArrowRight size={20} color="white" />}
                </TouchableOpacity>


                {/* Sign In Link */}
                <View style={styles.signInLinkContainer}>
                  <Text style={styles.signInLinkText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blurCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1000,
  },
  blurCircle1: {
    width: 128,
    height: 128,
    top: 80,
    right: 40,
  },
  blurCircle2: {
    width: 96,
    height: 96,
    bottom: 160,
    left: 32,
  },
  blurCircle3: {
    width: 64,
    height: 64,
    top: height * 0.33,
    left: width * 0.25,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerSpacer: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 120,
    height: 120,
  },
  logoGlowContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleAccent: {
    color: 'white',
  },
  titleUnderline: {
    width: 64,
    height: 4,
    backgroundColor: '#FCD34D',
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0F2F1',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#E0F2F1',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 48,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 12,
  },
  formFields: {
    gap: 24,
    marginBottom: 32,
  },
  nameFieldsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nameField: {
    flex: 1,
  },
  inputGroup: {
    // No additional styling needed
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 20,
  },
  termsContainer: {
    marginBottom: 32,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  createAccountButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  signInLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLinkText: {
    color: '#6B7280',
    fontSize: 16,
  },
  signInLink: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },
});