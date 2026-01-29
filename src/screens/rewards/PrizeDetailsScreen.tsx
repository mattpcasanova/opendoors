import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, ChevronLeft, MapPin, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, DeviceEventEmitter, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { rewardsService } from '../../services/rewardsService';
import { surveyService } from '../../services/surveyService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import RedemptionSurveyModal, { SurveyResponses } from '../../components/modals/RedemptionSurveyModal';
import type { Reward } from '../../components/main/RewardCard';
import type { RootNavigationProp, RootStackParamList } from '../../types/navigation';

export default function PrizeDetailsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'PrizeDetails'>>();
  const reward = route.params.reward;
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isClaimed, setIsClaimed] = useState(reward.claimed === true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isCollected, setIsCollected] = useState(!!reward.collected_at);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyReward, setSurveyReward] = useState<Reward | null>(null);

  // Check if this is a physical pickup reward
  const isPickupReward = reward.redemption_method === 'pickup';

  const handleMarkClaimed = async () => {
    if (!reward.id) return;
    
    Alert.alert(
      'Confirm Redemption',
      'Have you shown this reward to the business and received your item?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, Mark as Claimed',
          style: 'default',
          onPress: async () => {
            setIsClaiming(true);
            try {
              const { success, error } = await rewardsService.claimRewardById(reward.id);
              if (success) {
                setIsClaimed(true);
                showToast('Reward claimed successfully!', 'success');
                
                // Show survey modal to earn bonus door
                if (user && reward.id) {
                  // Check if user has already completed survey for this reward
                  const { data: hasCompletedSurvey } = await surveyService.hasSurveyForReward(user.id, reward.id);
                  if (!hasCompletedSurvey) {
                    setSurveyReward(reward as Reward);
                    setShowSurveyModal(true);
                  }
                }
              } else {
                showToast(error || 'Failed to claim reward', 'error');
              }
            } catch (error) {
              showToast('Failed to claim reward. Please try again.', 'error');
            } finally {
              setIsClaiming(false);
            }
          }
        }
      ]
    );
  };

  const handleCollectReward = async () => {
    if (!reward.id) return;

    Alert.alert(
      'Confirm Collection',
      'Have you physically received this reward?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, I Received It',
          style: 'default',
          onPress: async () => {
            setIsCollecting(true);
            try {
              const { success, error } = await rewardsService.collectRewardById(reward.id);
              if (success) {
                setIsCollected(true);
                showToast('Reward collected! Don\'t forget to complete the survey after you use it.', 'success');
              } else {
                showToast(error || 'Failed to mark as collected', 'error');
              }
            } catch (error) {
              showToast('Failed to mark as collected. Please try again.', 'error');
            } finally {
              setIsCollecting(false);
            }
          }
        }
      ]
    );
  };

  const handleSurveyComplete = async (responses: SurveyResponses) => {
    if (!user || !surveyReward) return;

    try {
      // Extract prize_id from reward object (check both snake_case and camelCase)
      const prizeId = surveyReward.prize_id || (surveyReward as any).prizeId || surveyReward.id;
      console.log('📋 Survey submission - Prize ID:', prizeId, 'Reward object:', {
        id: surveyReward.id,
        prize_id: surveyReward.prize_id,
        prizeId: (surveyReward as any).prizeId
      });

      const { data, error } = await surveyService.submitSurvey({
        userId: user.id,
        rewardId: surveyReward.id,
        prizeId: prizeId,
        responses,
      });

      if (error) {
        console.error('Failed to submit survey:', error);
        showToast('Survey submitted, but failed to grant bonus door', 'error');
      } else {
        console.log('✅ Survey completed! Bonus door granted:', data);
        showToast('Survey completed! Bonus door granted!', 'success');
        // Emit events to refresh user profile and earned rewards
        DeviceEventEmitter.emit('REFRESH_PROFILE');
        DeviceEventEmitter.emit('REFRESH_EARNED_DOORS');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      showToast('Error submitting survey. Please try again.', 'error');
    } finally {
      setShowSurveyModal(false);
      setSurveyReward(null);
    }
  };

  const handleSurveySkip = () => {
    setShowSurveyModal(false);
    setSurveyReward(null);
  };

  if (!reward) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, color: '#374151' }}>No reward details available</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 16,
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#111827',
          marginLeft: 8,
          flex: 1,
        }}>
          Reward Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* QR Code / Pickup Instructions Section */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          {/* Badge - Different for pickup vs digital */}
          {isPickupReward ? (
            <View style={{
              backgroundColor: '#FEF3C7',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <MapPin size={14} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={{ color: '#D97706', fontSize: 12, fontWeight: '600' }}>
                Physical Pickup
              </Text>
            </View>
          ) : reward.hasGiftCertificate && (
            <View style={{
              backgroundColor: '#DCFCE7',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="gift" size={14} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={{ color: '#16A34A', fontSize: 12, fontWeight: '600' }}>
                Gift Certificate
              </Text>
            </View>
          )}

          {/* Pickup Instructions (for physical rewards) */}
          {isPickupReward ? (
            <>
              {/* Pickup Contact */}
              {reward.pickup_contact && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  width: '100%',
                }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#009688',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                    <User size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>
                      Pick up from
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                      {reward.pickup_contact}
                    </Text>
                  </View>
                </View>
              )}

              {/* Pickup Instructions */}
              <View style={{
                backgroundColor: '#FEF3C7',
                padding: 16,
                borderRadius: 12,
                width: '100%',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 8 }}>
                  Instructions
                </Text>
                <Text style={{ fontSize: 14, color: '#78350F', lineHeight: 20 }}>
                  {reward.pickup_instructions || 'Show this screen to collect your reward.'}
                </Text>
              </View>

              {/* Collected Status */}
              {isCollected && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 16,
                  backgroundColor: '#DCFCE7',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#16A34A', fontSize: 13, fontWeight: '600' }}>
                    Reward collected
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              {/* QR Code (for digital rewards) */}
              <View style={{
                width: 192,
                height: 192,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                padding: 16,
              }}>
                <QRCode
                  value={reward.qrCode || reward.rewardCode || reward.id}
                  size={160}
                  backgroundColor="white"
                  color="#111827"
                />
              </View>

              {reward.hasGiftCertificate ? (
                <>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#16A34A', marginBottom: 8 }}>
                    Have Cashier Scan This QR Code
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', paddingHorizontal: 16 }}>
                    When scanned, the redemption code will appear on the cashier's screen
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                    Reward Code
                  </Text>
                  <Text style={{
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8,
                  }}>
                    {reward.rewardCode || 'N/A'}
                  </Text>
                </>
              )}
            </>
          )}
        </View>

        {/* Company Info */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#F3F4F6',
              marginRight: 16,
            }}>
              {reward.logo_url ? (
                <Image
                  source={{ uri: reward.logo_url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 24, textAlign: 'center', lineHeight: 48 }}>
                  {reward.icon}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                {reward.company}
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 4 }}>
                {reward.reward}
              </Text>
            </View>
          </View>
        </View>

        {/* Expiration Info */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={20} color="#EA580C" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
                Expiration
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 4 }}>
                {new Date(reward.expirationDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        {reward.instructions && reward.instructions.length > 0 && (
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
              Redemption Instructions
            </Text>
            {reward.instructions.map((instruction, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ color: '#6B7280', marginRight: 8 }}>•</Text>
                <Text style={{ flex: 1, color: '#6B7280' }}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Collect / Mark as Claimed Buttons */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          {!isClaimed ? (
            <>
              {/* For pickup rewards: Show "Collected Reward" button first */}
              {isPickupReward && !isCollected && (
                <>
                  <Text style={{
                    fontSize: 13,
                    color: '#6B7280',
                    textAlign: 'center',
                    marginBottom: 12,
                    lineHeight: 18
                  }}>
                    Tap below after you've physically received your reward.
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#009688',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isCollecting ? 0.6 : 1,
                      marginBottom: 16,
                    }}
                    onPress={handleCollectReward}
                    disabled={isCollecting}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      {isCollecting ? 'Processing...' : 'Collected Reward'}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 16 }} />
                </>
              )}

              {/* Mark as Claimed section */}
              <Text style={{
                fontSize: 13,
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: 12,
                lineHeight: 18
              }}>
                {isPickupReward
                  ? 'After using your reward, complete the survey below to earn a bonus door!'
                  : reward.hasGiftCertificate
                    ? 'The QR code will auto-claim when scanned. Use the button below only if scanning didn\'t work.'
                    : 'Can\'t scan the QR code? Manually mark this reward as claimed below.'}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: isPickupReward ? '#009688' : (reward.hasGiftCertificate ? '#6B7280' : '#009688'),
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: isClaiming ? 0.6 : 1,
                }}
                onPress={handleMarkClaimed}
                disabled={isClaiming}
                activeOpacity={0.8}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {isClaiming ? 'Claiming...' : (isPickupReward ? 'Mark as Claimed' : (reward.hasGiftCertificate ? 'Manual Claim (Fallback)' : 'Mark as Claimed'))}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
            }}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '600' }}>
                Already claimed
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Survey Modal */}
      {surveyReward && (
        <RedemptionSurveyModal
          visible={showSurveyModal}
          onClose={handleSurveySkip}
          onComplete={handleSurveyComplete}
          businessName={surveyReward.company}
          rewardId={surveyReward.id}
          prizeId={surveyReward.prize_id || surveyReward.id}
        />
      )}
    </SafeAreaView>
  );
}