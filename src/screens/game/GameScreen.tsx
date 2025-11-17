import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Door from '../../components/Door';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants';

interface GameStats {
  gamesPlayed: number;
  stayWins: number;
  switchWins: number;
}

type GameStage = 'selection' | 'montyReveal' | 'finalChoice' | 'result';

interface Props {
  prizeName?: string;
  prizeDescription?: string;
  locationName?: string;
  doorCount?: number;
  onGameComplete?: (
    won: boolean,
    switched: boolean,
    chosenDoor: number,
    winningDoor: number,
    revealedDoor: number | null,
    durationSeconds: number
  ) => void;
  onBack?: () => void;
}

const { width } = Dimensions.get('window');

export default function GameScreen({
  prizeName = "Free Prize",
  prizeDescription = "Win a prize",
  locationName = "Game Store",
  doorCount = 3,
  onGameComplete,
  onBack
}: Props) {
  // Calculate door layout based on door count
  const getDoorLayout = () => {
    console.log('🚪 Getting layout for door count:', doorCount);
    const maxWidth = width - 40; // Account for container padding
    const gap = 12; // Gap between doors

    const layout = (() => {
      switch (doorCount) {
        case 3:
          const size3 = Math.min(100, (maxWidth - gap * 2) / 3);
          return { rows: [3], doorSize: size3 };
        case 5:
          const size5 = Math.min(90, (maxWidth - gap * 2) / 3); // Size based on first row (3 doors)
          return { rows: [3, 2], doorSize: size5 };
        case 10:
          const size10 = Math.min(60, (maxWidth - gap * 4) / 5);
          return { rows: [5, 5], doorSize: size10 };
        default:
          console.warn('⚠️ Using default layout for unexpected door count:', doorCount);
          const sizeDefault = Math.min(100, (maxWidth - gap * 2) / 3);
          return { rows: [3], doorSize: sizeDefault };
      }
    })();

      return layout;
  };

  const layout = getDoorLayout();
  const doorSize = layout.doorSize;

  // Track game start time to compute duration
  const gameStartRef = useRef<number>(Date.now());

  // Game state
  const [gameStage, setGameStage] = useState<GameStage>('selection');
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedDoors, setRevealedDoors] = useState<number[]>([]);
  const [prizeLocation] = useState<number>(() => {
    const location = Math.floor(Math.random() * doorCount) + 1;
    return location;
  });
  const [switchedChoice, setSwitchedChoice] = useState<boolean>(false);
  const [doorAnimations] = useState(() => 
    Array.from({ length: doorCount }, () => new Animated.Value(0))
  );
  const [gameResult, setGameResult] = useState<{ won: boolean; message: string } | null>(null);

  // Add door states ref
  const doorStates = useRef<boolean[]>(Array(doorCount).fill(false));

  // Statistics (in memory only)
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    stayWins: 0,
    switchWins: 0
  });

  // Add new state for picking switch door
  const [switchPickMode, setSwitchPickMode] = useState(false);
  const [availableSwitchDoors, setAvailableSwitchDoors] = useState<number[]>([]);


  const getInstructions = (): string => {
    switch (gameStage) {
      case 'selection':
        return 'Choose a door to start your journey';
      case 'montyReveal':
        if (doorCount === 3) {
          return `You chose Door ${selectedDoor}. Would you like to switch to the other unopened door?`;
        } else {
          return `You chose Door ${selectedDoor}. I've revealed one goat. Would you like to switch to one of the other unopened doors?`;
        }
      case 'finalChoice':
        return `You ${switchedChoice ? 'switched to' : 'stayed with'} Door ${selectedDoor}. Click it to see what's behind your door.`;
      case 'result':
        return gameResult?.message || 'Opening doors...';
      default:
        return '';
    }
  };

  const handleDoorClick = (doorNumber: number) => {
    if (gameStage === 'selection') {
      setSelectedDoor(doorNumber);
      // reset start time when user starts the game interaction
      gameStartRef.current = Date.now();
      
      // Always reveal just 1 door to make the game more challenging
      const doorsToReveal = 1;
      
      const availableToReveal = Array.from({ length: doorCount }, (_, i) => i + 1)
        .filter(num => num !== doorNumber && num !== prizeLocation);
      
      const doorsToRevealList = availableToReveal
        .sort(() => Math.random() - 0.5)
        .slice(0, doorsToReveal);
      
      setRevealedDoors(doorsToRevealList);
      
      // Animate the doors opening
      setTimeout(() => {
        doorsToRevealList.forEach(door => openDoor(door));
        setGameStage('montyReveal');
      }, 1000);
    } else if (gameStage === 'finalChoice' && doorNumber === selectedDoor) {
      // Final reveal
      const won = doorNumber === prizeLocation;
      openDoor(doorNumber);
      
      // Set game stage to result but don't show message yet
      setGameStage('result');
      
      // Reveal all remaining doors after a delay
      setTimeout(() => {
        const allRemainingDoors: number[] = [];
        for (let i = 1; i <= doorCount; i++) {
          if (i !== doorNumber && !revealedDoors.includes(i)) {
            allRemainingDoors.push(i);
            openDoor(i);
          }
        }
        // Update revealedDoors state to include all doors
        setRevealedDoors(prev => [...prev, doorNumber, ...allRemainingDoors]);
      }, 500);
      
      // Show result message after door animation completes (1.5 seconds)
      setTimeout(() => {
        const message = won ?
          `Congratulations! You won the ${prizeName}!` :
          'Sorry! Better luck next time!';

        setGameResult({ won, message });
      }, 2100);
      
      // Call completion callback
      setTimeout(() => {
        onGameComplete?.(
          won,
          switchedChoice,
          selectedDoor ?? doorNumber,
          prizeLocation,
          revealedDoors.length > 0 ? revealedDoors[0] : null,
          0 // no timer tracking
        );
      }, 2000);
    }
  };

  const openDoor = (doorNumber: number) => {
    const doorIndex = doorNumber - 1;
    doorStates.current[doorIndex] = true;
    Animated.timing(doorAnimations[doorIndex], {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const finalChoice = (shouldSwitch: boolean) => {
    setSwitchedChoice(shouldSwitch);

    if (shouldSwitch) {
      if (doorCount > 3) {
        // Enter switch pick mode for 5/10 door games
        const remainingDoors = Array.from({ length: doorCount }, (_, i) => i + 1)
          .filter(num => num !== selectedDoor && !revealedDoors.includes(num));
        setAvailableSwitchDoors(remainingDoors);
        setSwitchPickMode(true);
        return;
      } else {
        // For 3-door, pick the only other door
        const remainingDoors = Array.from({ length: doorCount }, (_, i) => i + 1)
          .filter(num => num !== selectedDoor && !revealedDoors.includes(num));
        const newChoice = remainingDoors[Math.floor(Math.random() * remainingDoors.length)];
        setSelectedDoor(newChoice);
      }
    }

    setGameStage('finalChoice');
  };

  const handleSwitchPick = (doorNumber: number) => {
    setSelectedDoor(doorNumber);
    setSwitchPickMode(false);
    setGameStage('finalChoice');
  };

  const getDoorContent = (doorNumber: number): { type: 'icon'; name: string; color: string } | null => {
    const doorIndex = doorNumber - 1;
    if (!doorStates.current[doorIndex]) return null;

    if (doorNumber === prizeLocation) {
      return { type: 'icon', name: 'gift', color: '#FFD700' };
    }
    return { type: 'icon', name: 'close-circle', color: Colors.error };
  };

  const getDoorColor = (doorNumber: number): string => {
    if (selectedDoor === doorNumber && gameStage !== 'selection') {
      return Colors.primary; // Teal for selected
    }
    if (revealedDoors.includes(doorNumber)) {
      return Colors.gray600; // Gray for revealed
    }
    return '#8D6E63'; // Brown default
  };

  // Helper to determine if a door is selectable for switching
  const isSwitchSelectable = (doorNumber: number) => {
    return switchPickMode && availableSwitchDoors.includes(doorNumber);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{locationName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gameContainer}>
          {/* Prize Preview */}
          <View style={styles.prizePreview}>
            <View style={styles.prizeIconContainer}>
              <Ionicons name="gift" size={32} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prizePreviewTitle}>{prizeName}</Text>
              <Text style={styles.prizePreviewSubtitle}>{prizeDescription}</Text>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Ionicons
              name={
                gameStage === 'selection' ? 'hand-left' :
                gameStage === 'montyReveal' ? 'swap-horizontal' :
                gameStage === 'finalChoice' ? 'eye' :
                'information-circle'
              }
              size={20}
              color={Colors.primary}
              style={{ marginRight: Spacing.sm }}
            />
            <Text style={styles.instructions}>{getInstructions()}</Text>
          </View>
          
          {/* Doors */}
          <View style={styles.doorsContainer}>
            {layout.rows.map((doorsInRow, rowIndex) => (
              <View key={rowIndex} style={[
                styles.doorRow,
                rowIndex === layout.rows.length - 1 && { marginBottom: 0 }
              ]}>
                {Array.from({ length: doorsInRow }, (_, colIndex) => {
                  const doorNumber = layout.rows.slice(0, rowIndex).reduce((sum, row) => sum + row, 0) + colIndex + 1;
                  const selectable = isSwitchSelectable(doorNumber);
                  return (
                    <View key={doorNumber} style={[
                      styles.doorContainer,
                      doorsInRow === 2 && { maxWidth: '40%' } // Adjust max width for 2-door row
                    ]}>
                      <Door
                        doorNumber={doorNumber}
                        isOpen={revealedDoors.includes(doorNumber)}
                        content={getDoorContent(doorNumber)}
                        isSelected={selectedDoor === doorNumber}
                        onPress={() => {
                          if (switchPickMode && selectable) handleSwitchPick(doorNumber);
                          else handleDoorClick(doorNumber);
                        }}
                        disabled={switchPickMode ? !selectable : false}
                        isWinningDoor={doorNumber === prizeLocation}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          
          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {gameStage === 'montyReveal' && !switchPickMode && (
              <>
                <TouchableOpacity
                  style={[styles.gameButton, styles.stayButton]}
                  onPress={() => finalChoice(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={18} color={Colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.buttonText}>Stay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.gameButton, styles.switchButton]}
                  onPress={() => finalChoice(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="swap-horizontal" size={18} color={Colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.buttonText}>Switch</Text>
                </TouchableOpacity>
              </>
            )}
            {gameStage === 'montyReveal' && switchPickMode && (
              <View style={{ width: '100%', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 16, color: Colors.gray900, marginBottom: 16, fontWeight: '600' }}>
                  Pick a door to switch to:
                </Text>
                <ScrollView
                  style={{ maxHeight: 220, width: '100%' }}
                  contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}
                  showsVerticalScrollIndicator={false}
                >
                  {availableSwitchDoors.map(doorNum => (
                    <TouchableOpacity
                      key={doorNum}
                      style={{
                        backgroundColor: Colors.primary,
                        borderRadius: BorderRadius.md,
                        paddingVertical: 18,
                        paddingHorizontal: 28,
                        margin: 8,
                        ...Shadows.md,
                      }}
                      onPress={() => handleSwitchPick(doorNum)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '600' }}>
                        Door {doorNum}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Compact Result Banner */}
          {gameResult && (
            <View style={[
              styles.resultBanner,
              gameResult.won ? styles.resultBannerWin : styles.resultBannerLoss
            ]}>
              <View style={styles.resultBannerIconContainer}>
                <Ionicons
                  name={gameResult.won ? 'trophy' : 'heart'}
                  size={20}
                  color={gameResult.won ? '#F59E0B' : '#F59E0B'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultBannerTitle}>
                  {gameResult.won ? 'Congratulations!' : 'Better luck next time!'}
                </Text>
                <Text style={styles.resultBannerSubtitle}>
                  {gameResult.won
                    ? `You won the ${prizeName}!`
                    : `The prize was behind Door ${prizeLocation}`
                  }
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  } as ViewStyle,
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  } as ViewStyle,
  backButton: {
    padding: 8,
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.gray900,
  } as TextStyle,
  headerSpacer: {
    width: 40,
  } as ViewStyle,
  gameContainer: {
    flex: 1,
    padding: Spacing.lg,
  } as ViewStyle,
  prizePreview: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.gray100,
  } as ViewStyle,
  prizeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: Spacing.md,
  } as ViewStyle,
  prizePreviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gray900,
    marginBottom: 4,
  } as TextStyle,
  prizePreviewSubtitle: {
    fontSize: 14,
    color: Colors.gray600,
  } as TextStyle,
  instructionsContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: Spacing.xl,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...Shadows.sm,
  } as ViewStyle,
  instructions: {
    fontSize: 15,
    color: Colors.gray900,
    flex: 1,
    fontWeight: '500' as const,
  } as TextStyle,
  doorsContainer: {
    alignItems: 'center' as const,
    marginVertical: 25,
    width: '100%',
  } as ViewStyle,
  doorRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 12,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  } as ViewStyle,
  doorContainer: {
    alignItems: 'center' as const,
    flex: 1,
    maxWidth: '33.33%',
  } as ViewStyle,
  buttonsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: Spacing.md,
    marginTop: Spacing.xl,
  } as ViewStyle,
  gameButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    minWidth: 120,
    ...Shadows.sm,
  } as ViewStyle,
  stayButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  switchButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
  } as TextStyle,
  // Compact Result Banner
  resultBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.gray100,
  } as ViewStyle,
  resultBannerWin: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  } as ViewStyle,
  resultBannerLoss: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.gray300,
  } as ViewStyle,
  resultBannerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: Spacing.md,
  } as ViewStyle,
  resultBannerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gray900,
    marginBottom: 2,
  } as TextStyle,
  resultBannerSubtitle: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: '500' as const,
  } as TextStyle,
});