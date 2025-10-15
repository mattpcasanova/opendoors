import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TutorialVisualsProps {
  stepId: number;
}

export default function TutorialVisuals({ stepId }: TutorialVisualsProps) {
  const renderPlayCounter = () => (
    <View style={styles.playCounterContainer}>
      <View style={styles.playCounterCard}>
        <View style={styles.playCounterIcon}>
          <Ionicons name="play-circle" size={24} color="#14B8A6" />
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
          <Ionicons name="heart" size={20} color="#F44336" />
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
          <Ionicons name="heart-outline" size={20} color="#666" />
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
            <Ionicons name="calendar" size={16} color="#FF9800" />
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
          <Ionicons name="play-circle" size={24} color="#14B8A6" />
          <View style={styles.morePlaysText}>
            <Text style={styles.morePlaysTitle}>Watch Ad</Text>
            <Text style={styles.morePlaysSubtitle}>Get 1 free play (3 per day)</Text>
          </View>
        </View>
        
        <View style={styles.morePlaysOption}>
          <Ionicons name="people" size={24} color="#14B8A6" />
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#333',
  },
  playCounterSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  playCounterButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playCounterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameListContainer: {
    marginTop: 20,
    width: '100%',
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gameLogoText: {
    fontSize: 20,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameBusiness: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  gameTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  gameTagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  gamePlayButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  gamePlayButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardsContainer: {
    marginTop: 20,
    width: '100%',
  },
  rewardsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCode: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qrCodePattern: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rewardCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  rewardBusiness: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rewardLogoText: {
    fontSize: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardBusinessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
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
    color: '#333',
  },
  expirationDate: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  morePlaysContainer: {
    marginTop: 20,
    width: '100%',
  },
  morePlaysCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  morePlaysOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  morePlaysText: {
    marginLeft: 12,
    flex: 1,
  },
  morePlaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  morePlaysSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
