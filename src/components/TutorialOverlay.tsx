import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PlayCircle,
  List,
  Gamepad2,
  Gift,
  PlusCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants';
import MiniGame from './MiniGame';
import TutorialVisuals from './TutorialVisuals';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to OpenDoors!",
    description: "Let's take a quick tour to show you how to win amazing prizes in your neighborhood.",
    icon: "logo" // Special case for OpenDoors logo
  },
  {
    id: 2,
    title: "Check Your Plays",
    description: "You get 1 free play per day. Here's what the play counter looks like when you have plays available:",
    icon: "play-circle"
  },
  {
    id: 3,
    title: "Browse Available Games",
    description: "Scroll through the list of games from local businesses. Each game shows the prize you can win:",
    icon: "list"
  },
  {
    id: 4,
    title: "How the Game Works",
    description: "Try this mini-game to see how it works! Choose a door and follow the steps.",
    icon: "gamepad2"
  },
  {
    id: 5,
    title: "Claim Your Rewards",
    description: "If you win, your reward will appear in the Rewards tab with a QR code to show the business:",
    icon: "gift"
  },
  {
    id: 6,
    title: "Get More Plays",
    description: "Watch ads, refer friends, or receive gifted plays to get more chances to win:",
    icon: "plus-circle"
  },
  {
    id: 7,
    title: "You're All Set!",
    description: "Now you know how to play! Start exploring games and winning prizes. Good luck!",
    icon: "check-circle"
  }
];

export default function TutorialOverlay({ isVisible, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const progress = (currentStep + 1) / tutorialSteps.length;

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip Tutorial</Text>
      </TouchableOpacity>

      {/* Tutorial Content */}
      <Animated.View 
        style={[
          styles.tutorialContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark, Colors.success]}
          style={styles.tutorialCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {tutorialSteps.length}
            </Text>
          </View>

          {/* Step Content */}
          <View style={styles.stepContent}>
            <View style={styles.iconContainerOuter}>
              {step.icon === 'logo' ? (
                <BlurView
                  intensity={Platform.OS === 'ios' ? 95 : 100}
                  tint="light"
                  style={styles.iconContainer}
                >
                  <View style={styles.iconOverlay} pointerEvents="none" />
                  <Image
                    source={require('../../assets/images/OpenDoorsLogo.png')}
                    style={styles.logoImage}
                  />
                </BlurView>
              ) : (
                <View style={styles.iconContainer}>
                  {step.icon === 'play-circle' ? (
                    <PlayCircle size={60} color={Colors.white} />
                  ) : step.icon === 'list' ? (
                    <List size={60} color={Colors.white} />
                  ) : step.icon === 'gamepad2' ? (
                    <Gamepad2 size={60} color={Colors.white} />
                  ) : step.icon === 'gift' ? (
                    <Gift size={60} color={Colors.white} />
                  ) : step.icon === 'plus-circle' ? (
                    <PlusCircle size={60} color={Colors.white} />
                  ) : step.icon === 'check-circle' ? (
                    <CheckCircle size={60} color={Colors.white} />
                  ) : null}
                </View>
              )}
            </View>
            
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            {/* Mini Game for Step 4 */}
            {step.id === 4 && (
              <View style={styles.miniGameContainer}>
                <MiniGame onComplete={() => setCurrentStep(currentStep + 1)} />
              </View>
            )}
            
            {/* Visual Components for Steps 2, 3, 5, 6 */}
            {(step.id === 2 || step.id === 3 || step.id === 5 || step.id === 6) && (
              <TutorialVisuals stepId={step.id} />
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
                <ChevronLeft size={20} color={Colors.primary} />
                <Text style={styles.previousText}>Previous</Text>
              </TouchableOpacity>
            )}

            <View style={styles.nextButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  currentStep === tutorialSteps.length - 1 && styles.finishButton
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextText}>
                  {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next'}
                </Text>
                {currentStep === tutorialSteps.length - 1 ? (
                  <Check size={20} color={Colors.white} />
                ) : (
                  <ChevronRight size={20} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1001,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tutorialContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  tutorialCard: {
    borderRadius: 32,
    padding: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 4,
  },
  progressText: {
    color: Colors.white,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainerOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 15,
    marginBottom: 24,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 60,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 17,
    color: Colors.primaryLightest,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: 25,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 48,
  },
  previousText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
    gap: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 48,
  },
  finishButton: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  nextText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    zIndex: 1,
  },
  miniGameContainer: {
    marginTop: 20,
    width: '100%',
  },
});
