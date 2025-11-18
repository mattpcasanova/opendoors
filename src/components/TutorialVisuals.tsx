import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants';

interface TutorialVisualsProps {
  stepId: number;
}

export default function TutorialVisuals({ stepId }: TutorialVisualsProps) {
  const renderPlayCounter = () => (
    <View style={styles.playCounterContainer}>
      <View style={styles.playCounterCard}>
        <View style={styles.playCounterIcon}>
          <Ionicons name="play-circle" size={24} color={Colors.primary} />
        </View>
        <View style={styles.playCounterText}>
          <Text style={styles.playCounterTitle}>1 Play Available</Text>
          <Text style={styles.playCounterSubtitle}>Use it to win prizes!</Text>
        </View>
        <TouchableOpacity style={styles.playCounterButton}>
          <Text style={styles.playCounterButtonText}>Play Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGameList = () => (
    <View style={styles.gameListContainer}>
      <View style={styles.gameCard}>
        <View style={styles.gameCardHeader}>
          <View style={styles.gameLogo}>
            <Text style={styles.gameLogoText}>☕</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>Free Drink Upgrade</Text>
            <Text style={styles.gameBusiness}>Starbucks</Text>
            <View style={styles.gameTag}>
              <Text style={styles.gameTagText}>Coffee & Drinks</Text>
            </View>
          </View>
          <Ionicons name="heart" size={20} color={Colors.error} />
        </View>
        <TouchableOpacity style={styles.gamePlayButton}>
          <Text style={styles.gamePlayButtonText}>Play Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameCard}>
        <View style={styles.gameCardHeader}>
          <View style={styles.gameLogo}>
            <Text style={styles.gameLogoText}>🍟</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>Free Medium Fries</Text>
            <Text style={styles.gameBusiness}>McDonald's</Text>
            <View style={styles.gameTag}>
              <Text style={styles.gameTagText}>Food & Dining</Text>
            </View>
          </View>
          <Ionicons name="heart-outline" size={20} color={Colors.gray500} />
        </View>
        <TouchableOpacity style={styles.gamePlayButton}>
          <Text style={styles.gamePlayButtonText}>Play Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRewardsScreen = () => (
    <View style={styles.rewardsContainer}>
      <View style={styles.rewardsCard}>
        <View style={styles.qrCodeContainer}>
          <View style={styles.qrCode}>
            <View style={styles.qrCodePattern}>
              <Text style={styles.qrCodeText}>QR</Text>
            </View>
          </View>
          <Text style={styles.rewardCodeLabel}>Reward Code</Text>
          <Text style={styles.rewardCode}>REWARD_1760547603933_rewdwd</Text>
        </View>

        <View style={styles.rewardDetails}>
          <View style={styles.rewardBusiness}>
            <View style={styles.rewardLogo}>
              <Text style={styles.rewardLogoText}>☕</Text>
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardBusinessName}>Starbucks</Text>
              <Text style={styles.rewardDescription}>Upgrade any drink to the next size free</Text>
            </View>
          </View>

          <View style={styles.expirationContainer}>
            <Ionicons name="calendar" size={16} color={Colors.warning} />
            <View style={styles.expirationText}>
              <Text style={styles.expirationLabel}>Expiration</Text>
              <Text style={styles.expirationDate}>10/21/2025</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMorePlays = () => (
    <View style={styles.morePlaysContainer}>
      <View style={styles.morePlaysCard}>
        <View style={styles.morePlaysOption}>
          <Ionicons name="play-circle" size={24} color={Colors.primary} />
          <View style={styles.morePlaysText}>
            <Text style={styles.morePlaysTitle}>Watch Ad</Text>
            <Text style={styles.morePlaysSubtitle}>Get 1 free play (3 per day)</Text>
          </View>
        </View>

        <View style={styles.morePlaysOption}>
          <Ionicons name="people" size={24} color={Colors.primary} />
          <View style={styles.morePlaysText}>
            <Text style={styles.morePlaysTitle}>Refer Friend</Text>
            <Text style={styles.morePlaysSubtitle}>Both get 1 play</Text>
          </View>
        </View>
      </View>
    </View>
  );

  switch (stepId) {
    case 2:
      return renderPlayCounter();
    case 3:
      return renderGameList();
    case 5:
      return renderRewardsScreen();
    case 6:
      return renderMorePlays();
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  playCounterContainer: {
    marginTop: 20,
    width: '100%',
  },
  playCounterCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    height: 220,
  },
  playCounterIcon: {
    marginRight: 12,
  },
  playCounterText: {
    flex: 1,
  },
  playCounterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  playCounterSubtitle: {
    fontSize: 14,
    color: Colors.gray600,
  },
  playCounterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playCounterButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameListContainer: {
    marginTop: 20,
    width: '100%',
    height: 220,
  },
  gameCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  gameLogoText: {
    fontSize: 18,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  gameBusiness: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 3,
  },
  gameTag: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  gameTagText: {
    fontSize: 10,
    color: Colors.infoDark,
    fontWeight: '600',
  },
  gamePlayButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  gamePlayButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardsContainer: {
    marginTop: 20,
    width: '100%',
  },
  rewardsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    height: 220,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  qrCode: {
    width: 90,
    height: 90,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  qrCodePattern: {
    width: 70,
    height: 70,
    backgroundColor: Colors.gray900,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardCodeLabel: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 4,
  },
  rewardCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  rewardDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: 10,
  },
  rewardBusiness: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rewardLogoText: {
    fontSize: 18,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardBusinessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.gray600,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expirationText: {
    marginLeft: 8,
  },
  expirationLabel: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: '600',
  },
  expirationDate: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: 'bold',
  },
  morePlaysContainer: {
    marginTop: 20,
    width: '100%',
  },
  morePlaysCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    height: 220,
  },
  morePlaysOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  morePlaysText: {
    marginLeft: 12,
    flex: 1,
  },
  morePlaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  morePlaysSubtitle: {
    fontSize: 14,
    color: Colors.gray600,
  },
});
