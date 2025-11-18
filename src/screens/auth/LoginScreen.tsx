import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Gift, Heart, Lock, Mail, Trophy } from 'lucide-react-native';
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
import { supabase } from '../../services/supabase/client';
import { AuthStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation setup for logo lift
  const logoLiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Prefill saved email if present
    (async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync('rememberedEmail');
        if (savedEmail) {
          setFormData(prev => ({ ...prev, email: savedEmail }));
          setRememberMe(true);
        }
      } catch {}
    })();

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

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Starting login process...');
      const result = await signIn(email.trim(), password);

      console.log('🔍 Login result:', { 
        success: !result.error, 
        error: result.error?.message 
      });

      if (result.error) {
        let errorMessage = 'An error occurred during sign in';
        
        if (result.error.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
        
        Alert.alert('Error', errorMessage);
      } else {
        console.log('✅ Login successful, verifying user profile exists');
        // Ensure a user_profiles row exists; if not, sign the user out with a clear message
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (error && (error as any).code === 'PGRST116') {
            Alert.alert(
              'Account Not Found',
              'This account is not set up in OpenDoors. Please contact support or create a new account.',
              [{ text: 'OK' }]
            );
            try { await supabase.auth.signOut(); } catch {}
            return;
          }
          if (error) {
            Alert.alert('Error', 'Could not verify your account. Please try again.');
            try { await supabase.auth.signOut(); } catch {}
            return;
          }
        }

        // Remember Me: save or clear email AFTER successful login
        try {
          if (rememberMe) {
            await SecureStore.setItemAsync('rememberedEmail', formData.email.trim().toLowerCase());
          } else {
            await SecureStore.deleteItemAsync('rememberedEmail');
          }
        } catch {}

        // Let RootNavigator continue if profile exists
        console.log('✅ Profile verified, handing off to RootNavigator');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = (text: string) => {
    setFormData(prev => ({ ...prev, email: text }));
  };

  const updatePassword = (text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
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
                  <ArrowLeft size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.headerSpacer} />
              </View>

              {/* Enhanced Logo Section with Liquid Glass */}
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
                        source={require('../../../assets/OpenDoorsLogo.png')}
                        style={styles.logoImage}
                      />
                    </BlurView>
                  </View>
                </Animated.View>
              </View>

              {/* Enhanced Title Section */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  Welcome to <Text style={styles.titleAccent}>OpenDoors</Text>
                </Text>
                <View style={styles.titleUnderline} />
                <Text style={styles.subtitle}>
                  Sign in to continue your journey
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
                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Mail size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.gray400}
                        value={formData.email}
                        onChangeText={updateEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        autoFocus={Platform.OS === 'ios'}
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
                        style={styles.textInput}
                        placeholder="Enter your password"
                        placeholderTextColor={Colors.gray400}
                        value={formData.password}
                        onChangeText={updatePassword}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        {showPassword ? <EyeOff size={20} color={Colors.gray500} /> : <Eye size={20} color={Colors.gray500} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.rememberForgotContainer}>
                  <TouchableOpacity 
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, { opacity: loading ? 0.7 : 1 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signInButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                  {!loading && <ArrowRight size={20} color={Colors.white} />}
                </TouchableOpacity>


                {/* Create Account Link */}
                <View style={styles.createAccountLinkContainer}>
                  <Text style={styles.createAccountLinkText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.createAccountLink}>Create Account</Text>
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
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: 24,
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
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  signInButton: {
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
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  createAccountLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountLinkText: {
    color: Colors.gray500,
    fontSize: 16,
  },
  createAccountLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});