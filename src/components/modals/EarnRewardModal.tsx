import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { earnedRewardsService } from '../../services/earnedRewardsService';
import { referralService } from '../../services/referralService';
import { useState, useEffect, useRef } from 'react';

interface EarnRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  onReferFriend: () => void;
}

const { width } = Dimensions.get('window');

const EarnRewardModal: React.FC<EarnRewardModalProps> = ({
  visible,
  onClose,
  onWatchAd,
  onReferFriend
}) => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [adsRemaining, setAdsRemaining] = useState<number | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?.id) {
      referralService.getUserReferralCode(user.id).then(code => setReferralCode(code));
      // Load ad watch limit
      earnedRewardsService.getAdWatchesRemaining(user.id).then(({ remaining }) => {
        setAdsRemaining(remaining);
      });
    }
  }, [user?.id, visible]); // Reload when modal becomes visible

  useEffect(() => {
    if (visible) {
      // Slide up modal and fade in backdrop
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
      // Reset animations when modal closes
      slideAnim.setValue(600);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  // Generate deep link that opens directly to signup with referral code
  const deepLink = referralCode
    ? `opendoors://signup?ref=${referralCode}`
    : 'opendoors://signup';

  // For sharing, use the deep link directly
  // Note: This won't appear as clickable in Messages, but will work when manually opened
  // Or we can provide a web URL that redirects to the deep link
  const shareUrl = deepLink;

  const handleReferFriend = async () => {
    if (!referralCode) {
      Alert.alert('Error', 'Unable to generate referral code. Please try again.');
      return;
    }

    // Updated message with web URL (clickable in text messages)
    const referralMessage = `Hey! I'm using OpenDoors - a fun game where you can win real prizes! Join me and we'll both get extra doors to play with.\n\nOpen this link: ${shareUrl}\n\nOr enter referral code: ${referralCode}`;

    console.log('📎 Sharing referral with URL:', shareUrl);
    console.log('📎 Full message:', referralMessage);
    
    try {
      const result = await Share.share({
        message: referralMessage,
        title: 'Join me on OpenDoors!',
      });

      if (result.action === Share.sharedAction) {
        // Track referral shared
        if (user?.id) {
          analyticsService.trackReferralShared(user.id, {
            shareMethod: 'share',
          }).catch(err => console.error('Analytics error:', err));
        }

        // User shared successfully - reward is granted when friend plays first game
        onReferFriend();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to alert if sharing fails
      Alert.alert(
        "Refer a Friend",
        "Share this message with your friend:\n\n" + referralMessage,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy Link",
            onPress: async () => {
              // Copy link to clipboard
              await Clipboard.setStringAsync(shareUrl);
              Alert.alert('Link Copied!', `Referral link copied to clipboard:\n${shareUrl}\n\nOr share code: ${referralCode}`, [
                {
                  text: 'Open Link',
                  onPress: () => {
                    Linking.openURL(shareUrl).catch(err => console.error('Error opening link:', err));
                  }
                },
                { text: 'OK' }
              ]);
              // Reward is granted when friend plays first game
              onReferFriend();
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: backdropAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Earn a Reward</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {/* Watch Ad Option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                if (adsRemaining !== null && adsRemaining <= 0) {
                  Alert.alert(
                    'Daily Limit Reached',
                    'You have watched the maximum 3 ads for today. Come back tomorrow for more!',
                    [{ text: 'OK' }]
                  );
                } else {
                  onWatchAd();
                }
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={adsRemaining !== null && adsRemaining <= 0 ? ["#9CA3AF", "#9CA3AF"] : ["#14B8A6", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="tv" size={32} color="white" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Watch an Ad</Text>
                    <Text style={styles.optionDescription}>
                      Watch a 30-second ad to earn +1 door
                    </Text>
                    {adsRemaining !== null && (
                      <Text style={styles.limitText}>
                        {adsRemaining > 0
                          ? `${adsRemaining} of 3 remaining today`
                          : 'Daily limit reached (3/day)'}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Refer Friend Option */}
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleReferFriend}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#14B8A6", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="people" size={32} color="white" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Refer a Friend</Text>
                    <Text style={styles.optionDescription}>
                      Both you and your friend get +1 door
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            Choose how you'd like to earn your extra door
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
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
  optionsContainer: {
    padding: 20,
    gap: 16,
  },
  optionButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionGradient: {
    borderRadius: 16,
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  limitText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
    paddingTop: 0,
  },
});

export default EarnRewardModal;
