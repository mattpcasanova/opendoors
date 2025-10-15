import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Gamepad2, MapPin, Trophy } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthNavigation } from '../../hooks/useNavigation';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useAuthNavigation();
  
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

  return (
    <LinearGradient
      colors={['#14B8A6', '#0D9488', '#059669']}
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
          <Text style={styles.brandTitle}>
            Open <Text style={styles.brandAccent}>Doors</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Discover amazing prizes in your neighborhood
          </Text>
        </View>

        {/* Logo Section with Liquid Glass Effect */}
        <View style={styles.logoSection}>
          {/* Logo Container */}
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

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Gamepad2 size={24} color="white" />
              </View>
              <Text style={styles.featureText}>Play Games</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Trophy size={24} color="white" />
              </View>
              <Text style={styles.featureText}>Win Prizes</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MapPin size={24} color="white" />
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
              <ArrowRight size={20} color="#0D9488" />
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
            Join thousands of players already winning
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
    color: 'white',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 16,
  },
  brandAccent: {
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E0F2F1',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
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
    color: '#E0F2F1',
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
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  createAccountButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  ctaSubtext: {
    fontSize: 14,
    color: '#E0F2F1',
    textAlign: 'center',
  },
}); 