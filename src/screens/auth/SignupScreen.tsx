import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const formSlideAnim = useRef(new Animated.Value(50)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const logoScale = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
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
      colors={['#0F766E', '#14B8A6', '#06B6D4']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decorative elements */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
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
            {/* Enhanced Header Section */}
            <Animated.View 
              style={[
                styles.headerSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Back Button */}
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Animated.View 
                  style={[
                    styles.logoContainer,
                    { 
                      transform: [
                        { scale: logoScaleAnim },
                        { scale: logoScale }
                      ] 
                    }
                  ]}
                >
                  <View style={styles.logoInnerContainer}>
                    <Image 
                      source={require('../../../assets/OpenDoorsLogo.png')} 
                      style={styles.logoImage}
                    />
                  </View>
                  
                  {/* Floating elements around logo */}
                  <View style={[styles.floatingElement, styles.floatingElement1]}>
                    <Ionicons name="person-add" size={14} color="#14B8A6" />
                  </View>
                  <View style={[styles.floatingElement, styles.floatingElement2]}>
                    <Ionicons name="star" size={12} color="#F472B6" />
                  </View>
                  <View style={[styles.floatingElement, styles.floatingElement3]}>
                    <Ionicons name="checkmark-circle" size={16} color="#FB923C" />
                  </View>
                </Animated.View>

                <View style={styles.titleContainer}>
                  <Text style={styles.title}>
                    Join <Text style={styles.titleAccent}>OpenDoors</Text>
                  </Text>
                  <View style={styles.titleUnderline} />
                </View>

                <Text style={styles.subtitle}>
                  Create an account to start winning
                </Text>

                {/* Signup features */}
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons name="gift" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Daily prizes</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Win rewards</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="heart" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Free to play</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Enhanced Form Container */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: formSlideAnim }]
                }
              ]}
            >
              <View style={styles.formCard}>
                {/* Form Title */}
                <Text style={styles.formTitle}>Sign Up</Text>

                {/* Name Fields Row */}
                <View style={styles.nameFieldsRow}>
                  {/* First Name */}
                  <View style={styles.nameField}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="person" size={20} color="#14B8A6" />
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

                  {/* Last Name */}
                  <View style={styles.nameField}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <MaterialIcons name="person" size={20} color="#14B8A6" />
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

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="email" size={20} color="#14B8A6" />
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

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="lock" size={20} color="#14B8A6" />
                    </View>
                    <TextInput
                      style={styles.textInput}
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
                      style={styles.eyeButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="lock" size={20} color="#14B8A6" />
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
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[styles.signUpButton, { opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#14B8A6', '#0F766E']}
                    style={styles.signUpGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.signUpButtonText}>
                      {loading ? 'Signing Up...' : 'Sign Up'}
                    </Text>
                    {!loading && <Ionicons name="arrow-forward" size={20} color="white" />}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Sign Up Buttons */}
                <View style={styles.socialButtonsContainer}>
                  {/* Google Sign Up */}
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Text style={styles.socialIcon}>🔍</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>

                  {/* Apple Sign Up */}
                  <TouchableOpacity style={[styles.socialButton, styles.appleSocialButton]} activeOpacity={0.7}>
                    <Text style={styles.socialIcon}>🍎</Text>
                    <Text style={[styles.socialButtonText, { color: 'white' }]}>Apple</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Link */}
                <View style={styles.signInLinkContainer}>
                  <Text style={styles.signInLinkText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signInLink}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  backgroundDecorations: {
    position: 'absolute' as const,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  circle: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1000,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: height * 0.15,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: height * 0.4,
    right: -30,
  },
  circle4: {
    width: 80,
    height: 80,
    bottom: -40,
    left: width * 0.2,
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
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start' as const,
    padding: 12,
    marginLeft: -12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoSection: {
    alignItems: 'center' as const,
  },
  logoContainer: {
    position: 'relative' as const,
    marginBottom: 24,
  },
  logoInnerContainer: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 70,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain' as const,
  },
  floatingElement: {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingElement1: {
    top: -5,
    right: 5,
  },
  floatingElement2: {
    bottom: 15,
    left: -5,
  },
  floatingElement3: {
    top: 25,
    left: -10,
  },
  titleContainer: {
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 800 as const,
    color: 'white',
    textAlign: 'center' as const,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: '#FCD34D',
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#FCD34D',
    borderRadius: 2,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    lineHeight: 22,
    fontWeight: 500 as const,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuresContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    width: Dimensions.get('window').width - 48,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center' as const,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 600 as const,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    flex: 1,
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 800 as const,
    color: '#1E293B',
    textAlign: 'center' as const,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  nameFieldsRow: {
    flexDirection: 'row' as const,
    marginBottom: 24,
  },
  nameField: {
    flex: 1,
    marginRight: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 700 as const,
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconContainer: {
    width: 24,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: 500 as const,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 20,
  },
  signUpButton: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signUpGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 700 as const,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 500 as const,
  },
  socialButtonsContainer: {
    flexDirection: 'row' as const,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  appleSocialButton: {
    backgroundColor: '#000',
    borderColor: '#000',
    marginRight: 0,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: 600 as const,
    color: '#374151',
  },
  signInLinkContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  signInLinkText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 500 as const,
  },
  signInLink: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: 700 as const,
  },
};