import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface BonusPlayNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function BonusPlayNotification({ isVisible, onClose }: BonusPlayNotificationProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Animate in
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
    } else {
      // Reset animations
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

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
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          transform: [{ scale: scaleAnim }],
        }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#FEF3C7',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Ionicons name="star" size={30} color="#F59E0B" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'center' }}>
              Bonus Play Available!
            </Text>
          </View>

          {/* Notification Content */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 12 }}>
              You've earned a bonus play! 🎉
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
              Play any game for free using your bonus play.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center'
            }}
            onPress={onClose}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Got it!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
