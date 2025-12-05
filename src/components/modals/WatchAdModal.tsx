import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { earnedRewardsService } from '../../services/earnedRewardsService';

interface WatchAdModalProps {
  visible: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

const { width, height } = Dimensions.get('window');

const WatchAdModal: React.FC<WatchAdModalProps> = ({
  visible,
  onClose,
  onAdComplete
}) => {
  const { user } = useAuth();
  const [isWatching, setIsWatching] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [canClose, setCanClose] = useState(false);
  const [adsRemaining, setAdsRemaining] = useState<number | null>(null);
  const [isLoadingLimit, setIsLoadingLimit] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsWatching(false);
      setIsLoadingAd(false);
      setTimeRemaining(30);
      setCanClose(false);

      // Load ad watch limit
      const loadAdLimit = async () => {
        if (user?.id) {
          setIsLoadingLimit(true);
          const { remaining, error } = await earnedRewardsService.getAdWatchesRemaining(user.id);
          if (!error) {
            setAdsRemaining(remaining);
          }
          setIsLoadingLimit(false);
        }
      };
      loadAdLimit();

      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 25,
          stiffness: 200,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Clean up timers when modal closes
      cleanupTimers();

      // Reset animations
      slideAnim.setValue(600);
      backdropAnim.setValue(0);
    }

    // Cleanup on unmount
    return () => {
      cleanupTimers();
    };
  }, [visible, user?.id]);

  // Remove this useEffect - it was causing the modal to reset

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to clear all timers
  const cleanupTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const startAd = () => {
    // Check if user has reached daily limit
    if (adsRemaining !== null && adsRemaining <= 0) {
      Alert.alert('Daily Limit Reached', 'You have watched the maximum 3 ads for today. Come back tomorrow!');
      return;
    }

    // Clear any existing timers
    cleanupTimers();

    // Show loading state first
    setIsLoadingAd(true);
    setCanClose(false);

    // Simulate ad loading for 2 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoadingAd(false);
      setIsWatching(true);

      // Then start the countdown
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);
  };

  const handleClose = () => {
    // Clear all timers
    cleanupTimers();

    // Reset all state when closing
    setIsWatching(false);
    setIsLoadingAd(false);
    setTimeRemaining(30);
    setCanClose(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: backdropAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Watch Ad</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Ad Content */}
          <View style={styles.adContainer}>
            {!isWatching && !isLoadingAd ? (
              <View style={styles.adPlaceholder}>
                <Ionicons name="tv" size={64} color="#10B981" />
                <Text style={styles.adTitle}>Ready to Watch?</Text>
                <Text style={styles.adDescription}>
                  Watch a 30-second ad to earn +1 door
                </Text>

                {/* Daily limit info */}
                {adsRemaining !== null && (
                  <View style={styles.limitInfoContainer}>
                    <Text style={styles.limitInfoText}>
                      Max 3 ads per day
                    </Text>
                    <Text style={[
                      styles.remainingText,
                      adsRemaining === 0 && styles.remainingTextZero
                    ]}>
                      {adsRemaining} {adsRemaining === 1 ? 'ad' : 'ads'} remaining today
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.startButton,
                    (adsRemaining !== null && adsRemaining <= 0) && styles.startButtonDisabled
                  ]}
                  onPress={startAd}
                  disabled={adsRemaining !== null && adsRemaining <= 0}
                >
                  <Text style={styles.startButtonText}>
                    {adsRemaining !== null && adsRemaining <= 0 ? 'Come Back Tomorrow' : 'Start Ad'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isLoadingAd ? (
              <View style={styles.watchingContainer}>
                <View style={styles.adVideo}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.adText}>
                    Ad Loading...
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.watchingContainer}>
                <View style={styles.adVideo}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.adText}>
                    {timeRemaining > 0 ? 'Ad Playing...' : 'Ad Complete!'}
                  </Text>
                </View>
                {timeRemaining > 0 ? (
                  <>
                    <View style={styles.timerContainer}>
                      <Text style={styles.timerText}>{timeRemaining}s</Text>
                      <Text style={styles.timerDescription}>remaining</Text>
                    </View>
                    <Text style={styles.warningText}>
                      ⚠️ You must watch to completion to earn your reward
                    </Text>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.earnRewardButton}
                    onPress={async () => {
                      if (user?.id) {
                        try {
                          const { data, error } = await earnedRewardsService.addAdWatchReward(user.id);
                          if (error) {
                            console.error('Error adding ad watch reward:', error);
                            Alert.alert('Error', error);
                            return;
                          }
                          console.log('✅ Ad watch reward added successfully');

                          // Update the remaining ads count
                          const { remaining } = await earnedRewardsService.getAdWatchesRemaining(user.id);
                          setAdsRemaining(remaining);
                        } catch (error) {
                          console.error('Error in earn reward:', error);
                          Alert.alert('Error', 'Failed to add reward. Please try again.');
                          return;
                        }
                      }

                      // Clear all timers
                      cleanupTimers();

                      // Reset state before completing
                      setIsWatching(false);
                      setIsLoadingAd(false);
                      setTimeRemaining(30);
                      setCanClose(false);

                      // Call completion handlers
                      onAdComplete();
                      onClose();
                    }}
                  >
                    <Text style={styles.earnRewardButtonText}>Claim Earned Reward</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Footer */}
          {!isWatching && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Complete the ad to earn your +1 door reward
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  adContainer: {
    padding: 20,
    minHeight: 300,
    justifyContent: 'center',
  },
  adPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  limitInfoContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 24,
    width: '100%',
  },
  limitInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
    textAlign: 'center',
    marginBottom: 4,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  remainingTextZero: {
    color: '#EF4444',
  },
  watchingContainer: {
    alignItems: 'center',
  },
  adVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  adText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  timerDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  earnRewardButton: {
    backgroundColor: '#009688',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  earnRewardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WatchAdModal;
