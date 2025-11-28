import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Gamepad2, MapPin, Trophy } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuthNavigation } from '../../hooks/useNavigation';
import { useReferralLink } from '../../hooks/useReferralLink';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useAuthNavigation();
  const { referralCode } = useReferralLink();

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

  // Auto-navigate to Signup if there's a pending referral code from deep link
  useEffect(() => {
    if (referralCode) {
      console.log('📎 Referral code detected on Welcome screen, auto-navigating to Signup');
      // Small delay to ensure the screen is mounted
      const timer = setTimeout(() => {
        navigation.navigate('Signup');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [referralCode, navigation]);

  const logoLift = logoLiftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.success]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decorative elements - more subtle */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.blurCircle, styles.blurCircle1]} />
        <View style={[styles.blurCircle, styles.blurCircle2]} />
        <View style={[styles.blurCircle, styles.blurCircle3]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to</Text>
          <Text style={styles.brandTitle}>Open Doors</Text>
          <Text style={styles.headerSubtitle}>
            Discover amazing prizes in your neighborhood
          </Text>
        </View>

        {/* Logo Section with Liquid Glass Effect */}
        <View style={styles.logoSection}>
          {/* Logo Container with Liquid Glass */}
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
                  {/* Subtle white overlay for extra depth */}
                  <View style={styles.logoOverlay} pointerEvents="none" />

                  <Image
                    source={require('../../../assets/images/OpenDoorsLogo.png')}
                    style={styles.logoImage}
                  />
                </BlurView>
              </View>
            </Animated.View>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Gamepad2 size={24} color={Colors.white} />
              </View>
              <Text style={styles.featureText}>Play Games</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Trophy size={24} color={Colors.white} />
              </View>
              <Text style={styles.featureText}>Win Prizes</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MapPin size={24} color={Colors.white} />
              </View>
              <Text style={styles.featureText}>Local Deals</Text>
            </View>
          </View>
        </View>

        {/* Bottom CTA Area */}
        <View style={styles.ctaSection}>
          <View style={styles.buttonContainer}>
            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.9}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
              <ArrowRight size={20} color={Colors.primaryDark} />
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.ctaSubtext}>
            Open the door to a better day
          </Text>
        </View>
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
  header: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 16,
  },
  brandAccent: {
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.primaryLightest,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoWrapper: {
    width: 180,
    height: 180,
  },
  logoGlowContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 35,
    elevation: 25,
  },
  logoBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
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
    borderRadius: 90,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    zIndex: 1,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
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
  ctaSection: {
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  createAccountButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  ctaSubtext: {
    fontSize: 14,
    color: Colors.primaryLightest,
    textAlign: 'center',
  },
}); 