import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Gift, Heart, Play, Users, Tv } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants';

interface TutorialVisualsProps {
  stepId: number;
}

export default function TutorialVisuals({ stepId }: TutorialVisualsProps) {
  // Step 2: Daily Game Button (like HomeScreen)
  const renderPlayCounter = () => (
    <View style={styles.playCounterContainer}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.dailyGameButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Floating particles */}
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />

        <View style={styles.dailyGameContent}>
          <View style={styles.dailyGameIcon}>
            <Play size={32} color={Colors.white} />
          </View>

          <View style={styles.dailyGameText}>
            <Text style={styles.dailyGameTitle}>Daily Free Play</Text>
            <Text style={styles.dailyGameSubtitle}>Play now to win prizes!</Text>
          </View>
        </View>

        <View style={styles.playNowButton}>
          <Text style={styles.playNowButtonText}>Play Now</Text>
        </View>
      </LinearGradient>
    </View>
  );

  // Step 3: Game Cards (like GameCard component)
  const renderGameList = () => (
    <View style={styles.gameListContainer}>
      {/* Game Card 1 */}
      <View style={styles.gameCard}>
        <View style={styles.gradientTopBar}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.gradientBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        <View style={styles.gameCardContent}>
          <View style={styles.gameCardHeader}>
            <View style={styles.gameLogoContainer}>
              <Text style={styles.gameLogoText}>☕</Text>
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Free Coffee Upgrade</Text>
              <Text style={styles.gameBusiness}>Local Coffee Shop</Text>
              <View style={[styles.categoryBadge, { backgroundColor: Colors.infoLight }]}>
                <Text style={[styles.categoryBadgeText, { color: Colors.infoDark }]}>Coffee & Drinks</Text>
              </View>
            </View>

            <View style={styles.favoriteButton}>
              <Heart size={20} color={Colors.error} fill={Colors.error} />
            </View>
          </View>

          <View style={styles.gameCardFooter}>
            <View style={styles.playGameButton}>
              <Play size={16} color={Colors.white} />
              <Text style={styles.playGameButtonText}>Play Game</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Game Card 2 */}
      <View style={styles.gameCard}>
        <View style={styles.gradientTopBar}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.gradientBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        <View style={styles.gameCardContent}>
          <View style={styles.gameCardHeader}>
            <View style={styles.gameLogoContainer}>
              <Text style={styles.gameLogoText}>🍕</Text>
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Free Appetizer</Text>
              <Text style={styles.gameBusiness}>Pizza Palace</Text>
              <View style={[styles.categoryBadge, { backgroundColor: Colors.warningLight }]}>
                <Text style={[styles.categoryBadgeText, { color: Colors.warningDark }]}>Food & Dining</Text>
              </View>
            </View>

            <View style={styles.favoriteButton}>
              <Heart size={20} color={Colors.gray400} />
            </View>
          </View>

          <View style={styles.gameCardFooter}>
            <View style={styles.playGameButton}>
              <Play size={16} color={Colors.white} />
              <Text style={styles.playGameButtonText}>Play Game</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Step 5: Reward Card (like RewardCard component)
  const renderRewardsScreen = () => (
    <View style={styles.rewardsContainer}>
      <View style={styles.rewardCard}>
        {/* Gradient top bar */}
        <View style={styles.rewardTopBar}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.rewardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        <View style={styles.rewardContent}>
          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <View style={styles.qrCode}>
              <View style={styles.qrPattern}>
                <Text style={styles.qrText}>QR</Text>
              </View>
            </View>
            <Text style={styles.rewardCodeLabel}>Reward Code</Text>
            <Text style={styles.rewardCode}>RWD_ABC123XYZ</Text>
          </View>

          {/* Reward Details */}
          <View style={styles.rewardDetailsSection}>
            <View style={styles.rewardHeader}>
              <View style={styles.rewardLogoContainer}>
                <Text style={styles.rewardLogoText}>☕</Text>
              </View>
              <View style={styles.rewardInfoText}>
                <Text style={styles.rewardBusinessName}>Local Coffee Shop</Text>
                <Text style={styles.rewardDescription}>Upgrade any drink size for free</Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
              <View style={styles.statusBadge}>
                <Clock size={14} color={Colors.white} />
                <Text style={styles.statusBadgeText}>Expires in 7 days</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Step 6: Earn More Plays Modal (like EarnRewardModal)
  const renderMorePlays = () => (
    <View style={styles.morePlaysContainer}>
      <View style={styles.earnRewardCard}>
        <Text style={styles.earnRewardTitle}>Get More Plays</Text>

        <View style={styles.earnOptions}>
          {/* Watch Ad Option */}
          <View style={styles.earnOption}>
            <View style={styles.earnIconContainer}>
              <Tv size={24} color={Colors.white} />
            </View>
            <View style={styles.earnOptionText}>
              <Text style={styles.earnOptionTitle}>Watch Ad</Text>
              <Text style={styles.earnOptionDescription}>Get 1 free play (3 per day)</Text>
            </View>
          </View>

          {/* Refer Friend Option */}
          <View style={styles.earnOption}>
            <View style={styles.earnIconContainer}>
              <Users size={24} color={Colors.white} />
            </View>
            <View style={styles.earnOptionText}>
              <Text style={styles.earnOptionTitle}>Refer Friend</Text>
              <Text style={styles.earnOptionDescription}>Both get 1 play when they sign up</Text>
            </View>
          </View>

          {/* Receive Gift Option */}
          <View style={styles.earnOption}>
            <View style={styles.earnIconContainer}>
              <Gift size={24} color={Colors.white} />
            </View>
            <View style={styles.earnOptionText}>
              <Text style={styles.earnOptionTitle}>Receive Gift</Text>
              <Text style={styles.earnOptionDescription}>Friends can gift you plays</Text>
            </View>
          </View>
        </View>

        {/* Gradient Button */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.earnButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.earnButtonText}>Choose Option</Text>
        </LinearGradient>
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
  // Step 2: Daily Game Button Styles
  playCounterContainer: {
    marginTop: 20,
    width: '100%',
  },
  dailyGameButton: {
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle1: {
    top: 20,
    right: 30,
  },
  particle2: {
    bottom: 40,
    left: 40,
  },
  particle3: {
    top: 60,
    right: 60,
  },
  dailyGameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyGameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dailyGameText: {
    flex: 1,
  },
  dailyGameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  dailyGameSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  playBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  playNowButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playNowButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Step 3: Game Cards Styles
  gameListContainer: {
    marginTop: 20,
    width: '100%',
    gap: 12,
  },
  gameCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gradientTopBar: {
    height: 6,
  },
  gradientBar: {
    flex: 1,
  },
  gameCardContent: {
    padding: 16,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    marginRight: 12,
  },
  gameLogoText: {
    fontSize: 28,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: 4,
  },
  gameBusiness: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  gameCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  playGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playGameButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Step 5: Reward Card Styles
  rewardsContainer: {
    marginTop: 20,
    width: '100%',
  },
  rewardCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  rewardTopBar: {
    height: 6,
  },
  rewardGradient: {
    flex: 1,
  },
  rewardContent: {
    padding: 16,
  },
  qrSection: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    marginBottom: 16,
  },
  qrCode: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qrPattern: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray900,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardCodeLabel: {
    fontSize: 11,
    color: Colors.gray600,
    marginBottom: 4,
  },
  rewardCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  rewardDetailsSection: {
    gap: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rewardLogoText: {
    fontSize: 24,
  },
  rewardInfoText: {
    flex: 1,
  },
  rewardBusinessName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    color: Colors.gray600,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  // Step 6: Earn More Plays Styles
  morePlaysContainer: {
    marginTop: 20,
    width: '100%',
  },
  earnRewardCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  earnRewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },
  earnOptions: {
    gap: 16,
    marginBottom: 20,
  },
  earnOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  earnOptionText: {
    flex: 1,
  },
  earnOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: 4,
  },
  earnOptionDescription: {
    fontSize: 13,
    color: Colors.gray600,
  },
  earnButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  earnButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
