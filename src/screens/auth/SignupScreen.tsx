import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Calendar, Eye, EyeOff, Gift, Heart, Lock, Mail, Trophy, User } from 'lucide-react-native';
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
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useReferralLink } from '../../hooks/useReferralLink';
import { AuthStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signUp } = useAuth();
  const { referralCode: deepLinkReferralCode, shouldShowAlert, getAndClearReferralCode, markAlertShown } = useReferralLink();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '', // Manual referral code entry
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previousBirthDate, setPreviousBirthDate] = useState('');

  // Input refs for keyboard navigation
  const lastNameRef = useRef<TextInput>(null);
  const birthDateRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const referralCodeRef = useRef<TextInput>(null);

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

  // Auto-fill referral code from deep link
  useEffect(() => {
    if (deepLinkReferralCode && !formData.referralCode) {
      console.log('📎 Auto-filling referral code from deep link:', deepLinkReferralCode);
      setFormData(prev => ({ ...prev, referralCode: deepLinkReferralCode }));
      // Only show the alert if this is the first time (new deep link click)
      if (shouldShowAlert) {
        Alert.alert(
          'Referral Code Applied! 🎉',
          `Your friend's referral code has been automatically added. You'll both get +1 door after your first game!`,
          [{ text: 'Great!', style: 'default' }]
        );
        // Mark that we've shown the alert
        markAlertShown();
      }
    }
  }, [deepLinkReferralCode, shouldShowAlert]);

  const logoLift = logoLiftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const handleSignup = async () => {
    // Defensive extraction from form data
    const firstNameValue = formData?.firstName;
    const lastNameValue = formData?.lastName;
    const birthDateValue = formData?.birthDate;
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

    if (birthDateValue === undefined || birthDateValue === null || birthDateValue === '') {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }

    // Validate and check age
    const birthDate = String(birthDateValue).trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      Alert.alert('Error', 'Please enter a valid date in MM/DD/YYYY format');
      return;
    }

    // Parse and calculate age
    const [month, day, year] = birthDate.split('/').map(Number);
    const birthDateObj = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    if (age < 13) {
      Alert.alert(
        'Age Requirement',
        'You must be 13 years or older to use OpenDoors. This is required by law to protect children\'s privacy.',
        [{ text: 'OK' }]
      );
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
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Starting signup process...');
      
      // Get referral code from deep link OR manual entry (manual takes priority)
      const deepLinkCode = await getAndClearReferralCode();
      const manualCode = formData.referralCode?.trim().toUpperCase();
      const referralCode = manualCode || deepLinkCode;

      console.log('📎 Referral code resolution:', {
        deepLinkCode,
        manualCode,
        finalCode: referralCode,
        formDataCode: formData.referralCode
      });

      if (referralCode) {
        console.log('✅ Using referral code:', referralCode, manualCode ? '(manual)' : '(deep link)');
      } else {
        console.log('❌ No referral code provided');
      }
      
      const result = await signUp({
        firstName,
        lastName,
        birthDate,
        email,
        password,
      }, referralCode);

      console.log('🔍 Signup result:', { 
        success: !result.error, 
        error: result.error?.message 
      });

      if (result.error) {
        let errorMessage = 'An error occurred during sign up';
        
        if (result.error.message) {
          errorMessage = result.error.message;
          // Make Supabase errors more user-friendly
          if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
            errorMessage = 'This email is already registered. Please use a different email or sign in.';
          } else if (errorMessage.includes('invalid email')) {
            errorMessage = 'Please enter a valid email address.';
          } else if (errorMessage.includes('password')) {
            errorMessage = 'Password is too weak. Please use a stronger password.';
          }
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
        
        Alert.alert('Sign Up Error', errorMessage);
      } else {
        console.log('✅ Signup successful, letting RootNavigator handle flow');
        // Show success message
        Alert.alert(
          'Account Created! 🎉',
          'Please check your email to confirm your account before signing in.',
          [{ text: 'OK', style: 'default' }]
        );
        // Do not navigate or reset navigation here. RootNavigator will handle the flow based on auth state.
      }
    } catch (error) {
      console.warn('⚠️ Signup error:', error);
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

  const updateBirthDate = (text: string) => {
    // Strip all non-digits to get just the numbers
    const cleaned = text.replace(/\D/g, '');

    // Build the formatted string with slashes
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += cleaned[i];
    }

    setPreviousBirthDate(formatted);
    setFormData(prev => ({ ...prev, birthDate: formatted }));
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

  const updateReferralCode = (text: string) => {
    setFormData(prev => ({ ...prev, referralCode: text }));
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.success]}
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
                  <Ionicons name="arrow-back" size={24} color={Colors.white} />
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
                    <BlurView
                      intensity={Platform.OS === 'ios' ? 95 : 100}
                      tint="light"
                      style={styles.logoBlur}
                    >
                      <View style={styles.logoOverlay} pointerEvents="none" />
                      <Image
                        source={require('../../../assets/images/OpenDoorsLogo.png')}
                        style={styles.logoImage}
                      />
                    </BlurView>
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
                    <Gift size={24} color={Colors.white} />
                  </View>
                  <Text style={styles.featureText}>Daily prizes</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Trophy size={24} color={Colors.white} />
                  </View>
                  <Text style={styles.featureText}>Win rewards</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Heart size={24} color={Colors.white} />
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
                          <User size={20} color={Colors.primary} />
                        </View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="First name"
                          placeholderTextColor={Colors.gray400}
                          value={formData.firstName}
                          onChangeText={updateFirstName}
                          autoCapitalize="words"
                          returnKeyType="next"
                          onSubmitEditing={() => lastNameRef.current?.focus()}
                          blurOnSubmit={false}
                        />
                      </View>
                    </View>

                    <View style={styles.nameField}>
                      <Text style={styles.inputLabel}>Last Name</Text>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <User size={20} color={Colors.primary} />
                        </View>
                        <TextInput
                          ref={lastNameRef}
                          style={styles.textInput}
                          placeholder="Last name"
                          placeholderTextColor={Colors.gray400}
                          value={formData.lastName}
                          onChangeText={updateLastName}
                          autoCapitalize="words"
                          returnKeyType="next"
                          onSubmitEditing={() => birthDateRef.current?.focus()}
                          blurOnSubmit={false}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Birth Date Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Calendar size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        ref={birthDateRef}
                        style={styles.textInput}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={Colors.gray400}
                        value={formData.birthDate}
                        onChangeText={updateBirthDate}
                        keyboardType="number-pad"
                        maxLength={10}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                    <Text style={styles.helperText}>
                      You must be 13 or older to use OpenDoors
                    </Text>
                  </View>

                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Mail size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        ref={emailRef}
                        style={styles.textInput}
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.gray400}
                        value={formData.email}
                        onChangeText={updateEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Lock size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        ref={passwordRef}
                        style={styles.textInput}
                        placeholder="Create a password"
                        placeholderTextColor={Colors.gray400}
                        value={formData.password}
                        onChangeText={updatePassword}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                        returnKeyType="next"
                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        {showPassword ? <EyeOff size={20} color={Colors.gray500} /> : <Eye size={20} color={Colors.gray500} />}
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.inputHint}>Must be at least 8 characters</Text>
                  </View>

                  {/* Confirm Password Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Lock size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        ref={confirmPasswordRef}
                        style={styles.textInput}
                        placeholder="Confirm your password"
                        placeholderTextColor={Colors.gray400}
                        value={formData.confirmPassword}
                        onChangeText={updateConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoComplete="new-password"
                        returnKeyType="done"
                        onSubmitEditing={() => {
                          confirmPasswordRef.current?.blur();
                        }}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        {showConfirmPassword ? <EyeOff size={20} color={Colors.gray500} /> : <Eye size={20} color={Colors.gray500} />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Referral Code (Optional) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Gift size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter referral code if you have one"
                        placeholderTextColor={Colors.gray400}
                        value={formData.referralCode}
                        onChangeText={updateReferralCode}
                        autoCapitalize="characters"
                        autoComplete="off"
                        returnKeyType="done"
                      />
                    </View>
                    <Text style={styles.helperText}>
                      Have a friend's referral code? Enter it here and you'll both get +1 door after your first game!
                    </Text>
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
                  {!loading && <ArrowRight size={20} color={Colors.white} />}
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
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 20,
  },
  logoBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 60,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleAccent: {
    color: Colors.white,
  },
  titleUnderline: {
    width: 64,
    height: 4,
    backgroundColor: Colors.warning,
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.primaryLightest,
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
    color: Colors.primaryLightest,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 48,
    flex: 1,
    shadowColor: Colors.black,
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
    color: Colors.gray700,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 6,
    lineHeight: 16,
  },
  inputContainer: {
    backgroundColor: Colors.gray50,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: Colors.black,
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
    color: Colors.gray900,
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
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  createAccountButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  signInLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLinkText: {
    color: Colors.gray500,
    fontSize: 16,
  },
  signInLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});