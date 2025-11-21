import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface RedemptionSurveyModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (responses: SurveyResponses) => void;
  businessName: string;
  rewardId: string;
  prizeId: string;
}

export interface SurveyResponses {
  made_purchase: boolean;
  spend_amount?: 'under_5' | '5_10' | '10_20' | 'over_20';
  will_return: 'yes' | 'maybe' | 'no';
  discovery_source?: 'existing' | 'opendoors' | 'referral' | 'other';
}

export default function RedemptionSurveyModal({
  visible,
  onClose,
  onComplete,
  businessName,
  rewardId,
  prizeId,
}: RedemptionSurveyModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Survey responses
  const [madePurchase, setMadePurchase] = useState<boolean | null>(null);
  const [spendAmount, setSpendAmount] = useState<'under_5' | '5_10' | '10_20' | 'over_20' | null>(null);
  const [willReturn, setWillReturn] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [discoverySource, setDiscoverySource] = useState<'existing' | 'opendoors' | 'referral' | 'other' | null>(null);
  const [completedResponses, setCompletedResponses] = useState<SurveyResponses | null>(null);

  const totalQuestions = madePurchase ? 4 : 3; // Skip Q2 if no purchase

  const handleNext = () => {
    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Question 0: Purchase behavior
    if (currentQuestion === 0 && madePurchase !== null) {
      if (madePurchase) {
        setCurrentQuestion(1); // Show Q2 (spend amount)
      } else {
        setCurrentQuestion(2); // Skip to Q3 (return intent)
      }
    }
    // Question 1: Spend amount (only if made purchase)
    else if (currentQuestion === 1 && spendAmount !== null) {
      setCurrentQuestion(2);
    }
    // Question 2: Return intent
    else if (currentQuestion === 2 && willReturn !== null) {
      setCurrentQuestion(3);
    }
    // Question 3: Discovery source
    else if (currentQuestion === 3 && discoverySource !== null) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const responses: SurveyResponses = {
      made_purchase: madePurchase!,
      spend_amount: spendAmount || undefined,
      will_return: willReturn!,
      discovery_source: discoverySource || undefined,
    };

    setCompletedResponses(responses);
    setShowCompletion(true);
    // Don't auto-close - wait for user to tap "Got it!"
  };

  const handleGotIt = () => {
    if (completedResponses) {
      onComplete(completedResponses);
      resetSurvey();
    }
  };

  const resetSurvey = () => {
    setCurrentQuestion(0);
    setMadePurchase(null);
    setSpendAmount(null);
    setWillReturn(null);
    setDiscoverySource(null);
    setCompletedResponses(null);
    setShowCompletion(false);
  };

  const handleSkip = () => {
    resetSurvey();
    onClose();
  };

  const canProceed = () => {
    if (currentQuestion === 0) return madePurchase !== null;
    if (currentQuestion === 1) return spendAmount !== null;
    if (currentQuestion === 2) return willReturn !== null;
    if (currentQuestion === 3) return discoverySource !== null;
    return false;
  };

  const renderQuestion = () => {
    // Question 0: Purchase behavior
    if (currentQuestion === 0) {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            Did you make any other purchases with your free item?
          </Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                madePurchase === true && styles.optionButtonSelected,
              ]}
              onPress={() => setMadePurchase(true)}
            >
              <Ionicons
                name={madePurchase === true ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={madePurchase === true ? '#009688' : '#6B7280'}
              />
              <Text style={[
                styles.optionText,
                madePurchase === true && styles.optionTextSelected,
              ]}>
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                madePurchase === false && styles.optionButtonSelected,
              ]}
              onPress={() => setMadePurchase(false)}
            >
              <Ionicons
                name={madePurchase === false ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={madePurchase === false ? '#009688' : '#6B7280'}
              />
              <Text style={[
                styles.optionText,
                madePurchase === false && styles.optionTextSelected,
              ]}>
                No, just the free item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Question 1: Spend amount (only if made purchase)
    if (currentQuestion === 1) {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>About how much did you spend?</Text>
          <View style={styles.optionsContainer}>
            {[
              { label: 'Under $5', value: 'under_5' as const },
              { label: '$5-$10', value: '5_10' as const },
              { label: '$10-$20', value: '10_20' as const },
              { label: 'Over $20', value: 'over_20' as const },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  spendAmount === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setSpendAmount(option.value)}
              >
                <Ionicons
                  name={spendAmount === option.value ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={spendAmount === option.value ? '#009688' : '#6B7280'}
                />
                <Text style={[
                  styles.optionText,
                  spendAmount === option.value && styles.optionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Question 2: Return intent
    if (currentQuestion === 2) {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            Will you visit {businessName} again?
          </Text>
          <View style={styles.optionsContainer}>
            {[
              { label: 'Yes, definitely', value: 'yes' as const, icon: 'heart' },
              { label: 'Maybe', value: 'maybe' as const, icon: 'help-circle' },
              { label: 'Probably not', value: 'no' as const, icon: 'close-circle' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  willReturn === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setWillReturn(option.value)}
              >
                <Ionicons
                  name={willReturn === option.value ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={willReturn === option.value ? '#009688' : '#6B7280'}
                />
                <Text style={[
                  styles.optionText,
                  willReturn === option.value && styles.optionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Question 3: Discovery source
    if (currentQuestion === 3) {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            How did you first learn about {businessName}?
          </Text>
          <View style={styles.optionsContainer}>
            {[
              { label: 'Already knew about it', value: 'existing' as const },
              { label: 'Found through OpenDoors', value: 'opendoors' as const },
              { label: 'Friend/family recommended', value: 'referral' as const },
              { label: 'Other', value: 'other' as const },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  discoverySource === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setDiscoverySource(option.value)}
              >
                <Ionicons
                  name={discoverySource === option.value ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={discoverySource === option.value ? '#009688' : '#6B7280'}
                />
                <Text style={[
                  styles.optionText,
                  discoverySource === option.value && styles.optionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
  };

  // Confetti animation state
  const [confettiParticles] = useState(() =>
    Array.from({ length: 30 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
    }))
  );

  // Animate confetti when completion shows
  useEffect(() => {
    if (showCompletion) {
      confettiParticles.forEach((particle, i) => {
        const angle = (Math.PI * 2 * i) / confettiParticles.length;
        const distance = 80 + Math.random() * 120;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance - Math.random() * 80;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: endX,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [showCompletion]);

  if (showCompletion) {
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#009688'];

    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={() => {}} // Prevent Android back button from closing
      >
        <View style={styles.completionOverlay}>
          <View style={styles.completionContainer}>
            {/* Confetti particles */}
            {confettiParticles.map((particle, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confettiParticle,
                  {
                    backgroundColor: colors[i % colors.length],
                    transform: [
                      { translateX: particle.x },
                      { translateY: particle.y },
                      {
                        rotate: particle.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '720deg'],
                        }),
                      },
                    ],
                    opacity: particle.opacity,
                  },
                ]}
              />
            ))}

            {/* Header with icon */}
            <View style={styles.completionHeader}>
              <View style={styles.completionIconCircle}>
                <Ionicons name="gift" size={30} color="#009688" />
              </View>
              <Text style={styles.completionTitle}>Door Earned! 🎉</Text>
            </View>

            {/* Content */}
            <View style={styles.completionContent}>
              <Text style={styles.doorsText}>+1 Door</Text>
              <Text style={styles.completionFrom}>From: Completing Survey</Text>
              <Text style={styles.completionMessage}>
                You can now use this door to play any game!
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.completionButton}
              onPress={handleGotIt}
            >
              <Text style={styles.completionButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.doorIcon}>
                <Ionicons name="enter" size={24} color="#009688" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Quick Survey = Bonus Door!</Text>
                <Text style={styles.headerSubtitle}>
                  Help us improve and get +1 free door (30 seconds)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {totalQuestions}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentQuestion + 1) / totalQuestions) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Question */}
          <Animated.View style={{ flex: 1, opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }) }}>
            {renderQuestion()}
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {/* Back Button - only show if not on first question */}
            {currentQuestion > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  // Animate transition
                  Animated.sequence([
                    Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: 150,
                      useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                      toValue: 0,
                      duration: 150,
                      useNativeDriver: true,
                    }),
                  ]).start();

                  // Go back to previous question
                  if (currentQuestion === 2) {
                    // If on Q3 and user made purchase, go to Q2, else Q1
                    setCurrentQuestion(madePurchase ? 1 : 0);
                  } else {
                    setCurrentQuestion(currentQuestion - 1);
                  }
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {/* Next Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.nextButtonDisabled,
                currentQuestion > 0 && styles.nextButtonWithBack,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <LinearGradient
                colors={canProceed() ? ['#009688', '#00796B'] : ['#E5E7EB', '#D1D5DB']}
                style={styles.nextButtonGradient}
              >
                <Text style={[
                  styles.nextButtonText,
                  !canProceed() && styles.nextButtonTextDisabled,
                ]}>
                  {currentQuestion === 3 ? 'Complete' : 'Next'}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={canProceed() ? 'white' : '#9CA3AF'}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    height: height * 0.75,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  doorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    maxWidth: width - 140,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#009688',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#009688',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E0F2F1',
    borderColor: '#009688',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  optionTextSelected: {
    color: '#009688',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonWithBack: {
    flex: 2,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completionContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    left: '50%',
    top: '50%',
    marginLeft: -5,  // Half of width to center
    marginTop: -5,   // Half of height to center
  },
  completionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  completionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  completionContent: {
    marginBottom: 24,
    alignItems: 'center',
  },
  doorsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  completionFrom: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  completionMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  completionButton: {
    backgroundColor: '#009688',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
