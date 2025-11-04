import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../hooks/useAuth';
import { earnedRewardsService } from '../../services/earnedRewardsService';
import { referralService } from '../../services/referralService';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (user?.id) {
      referralService.getUserReferralCode(user.id).then(code => setReferralCode(code));
    }
  }, [user?.id]);

  // Use deep link for referral (works without website)
  // Format: opendoors://?ref=CODE
  const deepLinkUrl = referralCode 
    ? `opendoors://?ref=${referralCode}`
    : 'opendoors://';
  
  // Also generate web URL if configured (for future use with website)
  const referralUrl = (Constants.expoConfig as any)?.extra?.referralUrl;
  const webUrl = referralUrl && referralCode 
    ? `${referralUrl}?ref=${referralCode}`
    : null;
  
  // Use deep link as primary, web URL as fallback if available
  const shareUrl = deepLinkUrl;

  const handleReferFriend = async () => {
    if (!referralCode) {
      Alert.alert('Error', 'Unable to generate referral code. Please try again.');
      return;
    }

    // Updated message with deep link (works for testing and production)
    const referralMessage = `Hey! I'm using OpenDoors - a fun game where you can win real prizes! Join me and we'll both get extra doors to play with.\n\nOpen this link: ${shareUrl}\n\nOr enter referral code: ${referralCode}`;
    
    try {
      const result = await Share.share({
        message: referralMessage,
        title: 'Join me on OpenDoors!',
      });

      if (result.action === Share.sharedAction) {
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
            onPress: () => {
              // Show link in alert - user can manually copy
              // When website is live, we can add proper clipboard support
              Alert.alert('Referral Link', `${shareUrl}\n\nOr share code: ${referralCode}`, [
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
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
              onPress={onWatchAd}
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
                    <Ionicons name="tv" size={32} color="white" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Watch an Ad</Text>
                    <Text style={styles.optionDescription}>
                      Watch a 30-second ad to earn +1 door
                    </Text>
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
        </View>
      </View>
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
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
    paddingTop: 0,
  },
});

export default EarnRewardModal;
