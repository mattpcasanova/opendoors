import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

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
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Enhanced Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View 
              style={[
                styles.logoContainer,
                { transform: [{ rotate: logoRotation }] }
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
                <Ionicons name="star" size={16} color="#FCD34D" />
              </View>
              <View style={[styles.floatingElement, styles.floatingElement2]}>
                <Ionicons name="gift" size={14} color="#F472B6" />
              </View>
              <View style={[styles.floatingElement, styles.floatingElement3]}>
                <Ionicons name="trophy" size={12} color="#FB923C" />
              </View>
            </Animated.View>
            {/* App name with enhanced typography */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Open<Text style={styles.titleAccent}>Doors</Text>
              </Text>
              <View style={styles.titleUnderline} />
            </View>
            <Text style={styles.subtitle}>
              Your gateway to winning amazing prizes
            </Text>
            {/* Feature highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featureText}>Local businesses</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="gift" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featureText}>Real prizes</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="game-controller" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featureText}>Fun games</Text>
              </View>
            </View>
          </View>
          {/* Enhanced Button Section */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.signInGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#0F766E" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.8}
            >
              <View style={styles.signUpContent}>
                <Text style={styles.signUpButtonText}>Create Account</Text>
                <Ionicons name="person-add" size={20} color="white" />
              </View>
            </TouchableOpacity>
            {/* Additional CTA */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Join thousands of winners today
              </Text>
            </View>
          </View>
        </Animated.View>
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
  circle: {
    position: 'absolute',
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
    top: height * 0.2,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: height * 0.3,
    right: -30,
  },
  circle4: {
    width: 80,
    height: 80,
    bottom: -40,
    left: width * 0.3,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 60,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logoInnerContainer: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  floatingElement: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingElement1: {
    top: -10,
    right: 10,
  },
  floatingElement2: {
    bottom: 20,
    left: -10,
  },
  floatingElement3: {
    top: 30,
    left: -15,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -1,
  },
  titleAccent: {
    color: '#FCD34D',
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#FCD34D',
    borderRadius: 2,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  buttonSection: {
    width: '100%',
    gap: 16,
  },
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  signInButtonText: {
    color: '#0F766E',
    fontSize: 18,
    fontWeight: '700',
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  ctaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
}); 