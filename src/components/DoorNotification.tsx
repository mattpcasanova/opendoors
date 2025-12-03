import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DoorNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  distributorName: string;
  doorsSent: number;
  reason?: string;
  notificationId: string;
}

export default function DoorNotification({
  isVisible,
  onClose,
  distributorName,
  doorsSent,
  reason,
}: DoorNotificationProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  useEffect(() => {
    if (isVisible) {
      isClosing.current = false;
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
    }
  }, [isVisible, scaleAnim, fadeAnim]);

  const handleClose = useCallback(() => {
    if (isClosing.current) {
      return;
    }

    isClosing.current = true;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset for next open
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
      isClosing.current = false;
      onClose();
    });
  }, [onClose, scaleAnim, fadeAnim]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        pointerEvents={isClosing.current ? 'none' : 'auto'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="gift" size={30} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Doors Received!</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.doorsText}>
            +{doorsSent} Door{doorsSent > 1 ? 's' : ''}
          </Text>
          <Text style={styles.fromText}>From: {distributorName}</Text>
          {reason && <Text style={styles.reasonText}>{reason}</Text>}
          <Text style={styles.helpText}>
            You can now use these doors to play games!
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Got it!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.gray900,
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  doorsText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  fromText: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: Colors.gray400,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
