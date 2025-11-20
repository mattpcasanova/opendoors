import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants';

interface EarnedRewardNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  sourceName: string;
  doorsEarned: number;
}

export default function EarnedRewardNotification({
  isVisible,
  onClose,
  sourceName,
  doorsEarned
}: EarnedRewardNotificationProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Confetti animation state
  const [confettiParticles] = useState(() =>
    Array.from({ length: 30 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    if (isVisible) {
      // Animate in modal
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti
      confettiParticles.forEach((particle, i) => {
        const angle = (Math.PI * 2 * i) / confettiParticles.length;
        const distance = 80 + Math.random() * 120;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance - Math.random() * 80;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: endX,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
      confettiParticles.forEach(particle => {
        particle.x.setValue(0);
        particle.y.setValue(0);
        particle.opacity.setValue(1);
        particle.rotation.setValue(0);
      });
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#009688'];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        opacity: fadeAnim,
      }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={{
          backgroundColor: Colors.white,
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          transform: [{ scale: scaleAnim }],
        }}>
          {/* Confetti particles */}
          {confettiParticles.map((particle, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: 2,
                left: '50%',
                top: '50%',
                marginLeft: -5,
                marginTop: -5,
                backgroundColor: colors[i % colors.length],
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  {
                    rotate: particle.rotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
                opacity: particle.opacity,
              }}
            />
          ))}
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: Colors.primaryLightest,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name="gift" size={30} color={Colors.primary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.gray900, textAlign: 'center' }}>
              Door Earned! 🎉
            </Text>
          </View>

          {/* Notification Content */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.gray900, textAlign: 'center', marginBottom: 8 }}>
              +{doorsEarned} Door{doorsEarned > 1 ? 's' : ''}
            </Text>
            <Text style={{ fontSize: 16, color: Colors.gray600, textAlign: 'center', marginBottom: 12 }}>
              From: {sourceName}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.gray400, textAlign: 'center' }}>
              You can now use this door to play any game!
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center'
            }}
            onPress={onClose}
          >
            <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '600' }}>
              Got it!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
