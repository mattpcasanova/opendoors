import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
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
