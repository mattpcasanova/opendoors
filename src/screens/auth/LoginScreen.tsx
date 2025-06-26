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

  const handleLogin = async () => {
    if (loading) return; // Prevent multiple calls
    // Defensive extraction from form data
    const emailValue = formData?.email;
    const passwordValue = formData?.password;
    
    if (emailValue === undefined || emailValue === null || emailValue === '') {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    if (passwordValue === undefined || passwordValue === null || passwordValue === '') {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    const email = String(emailValue).trim();
    const password = String(passwordValue);

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
      const result = await signIn(email, password);
      console.log('signIn result:', result);
      if (result.error) {
        console.error('Sign in error:', result.error);
        let errorMessage = 'An error occurred during sign in';
        if (result.error.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
        Alert.alert('Error', errorMessage);
        return;
      }
    } catch (error) {
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
                    <Ionicons name="log-in" size={14} color="#14B8A6" />
                  </View>
                  <View style={[styles.floatingElement, styles.floatingElement2]}>
                    <Ionicons name="key" size={12} color="#F472B6" />
                  </View>
                  <View style={[styles.floatingElement, styles.floatingElement3]}>
                    <Ionicons name="checkmark-circle" size={16} color="#FB923C" />
                  </View>
                </Animated.View>

                <View style={styles.titleContainer}>
                  <Text style={styles.title}>
                    Welcome <Text style={styles.titleAccent}>Back!</Text>
                  </Text>
                  <View style={styles.titleUnderline} />
                </View>

                <Text style={styles.subtitle}>
                  Sign in to continue your winning journey
                </Text>

                {/* Welcome back features */}
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Your prizes</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Game history</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="star" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featureText}>Rewards</Text>
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
                <Text style={styles.formTitle}>Sign In</Text>

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
                      autoComplete="current-password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
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

                {/* Forgot Password */}
                <TouchableOpacity 
                  style={styles.forgotPasswordButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, { opacity: loading ? 0.7 : 1 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#14B8A6', '#0F766E']}
                    style={styles.signInGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.signInButtonText}>
                      {loading ? 'Signing In...' : 'Sign In'}
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

                {/* Social Login Buttons */}
                <View style={styles.socialButtonsContainer}>
                  {/* Google Sign In */}
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Text style={styles.socialIcon}>🔍</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>

                  {/* Apple Sign In */}
                  <TouchableOpacity style={[styles.socialButton, styles.appleSocialButton]} activeOpacity={0.7}>
                    <Text style={styles.socialIcon}>🍎</Text>
                    <Text style={[styles.socialButtonText, { color: 'white' }]}>Apple</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpLinkContainer}>
                  <Text style={styles.signUpLinkText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signUpLink}>Sign up</Text>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end' as const,
    marginBottom: 32,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: 700 as const,
    letterSpacing: 0.3,
  },
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signInGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  signInButtonText: {
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
  signUpLinkContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  signUpLinkText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 500 as const,
  },
  signUpLink: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: 700 as const,
  },
};