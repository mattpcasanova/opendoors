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

  const referralUrl = (Constants.expoConfig as any)?.extra?.referralUrl || 'https://opendoors.app/download';

  const handleReferFriend = async () => {
    const referralMessage = `Hey! I'm using OpenDoors - a fun game where you can win real prizes! Join me and we'll both get extra doors to play with. Download here: ${referralUrl}`;
    
    try {
      const result = await Share.share({
        message: referralMessage,
        title: 'Join me on OpenDoors!',
      });

      if (result.action === Share.sharedAction) {
        // User shared successfully - add referral reward
        if (user?.id) {
          try {
            const { data, error } = await earnedRewardsService.addReferralReward(user.id);
            if (error) {
              console.error('Error adding referral reward:', error);
              return;
            }
          } catch (error) {
            console.error('Error in referral reward:', error);
            return;
          }
        }
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
              console.log("Copy referral link to clipboard");
              // Add referral reward even for copy action
              if (user?.id) {
                try {
                  const { data, error } = await earnedRewardsService.addReferralReward(user.id);
                  if (error) {
                    console.error('Error adding referral reward:', error);
                    return;
                  }
                } catch (error) {
                  console.error('Error in referral reward:', error);
                  return;
                }
              }
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
