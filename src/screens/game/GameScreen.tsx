import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameStats {
  gamesPlayed: number;
  stayWins: number;
  switchWins: number;
}

interface Props {
  prizeName?: string;
  prizeDescription?: string;
  locationName?: string;
  doorCount?: number;
  onGameComplete?: (won: boolean, switched: boolean) => void;
  onBack?: () => void;
}

type GameStage = 'selection' | 'montyReveal' | 'finalChoice' | 'result';

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
    switch (doorCount) {
      case 3:
        return { rows: [3], doorSize: 100 };
      case 5:
        return { rows: [3, 2], doorSize: 90 };
      case 10:
        return { rows: [5, 5], doorSize: 60 };
      default:
        return { rows: [3], doorSize: 100 };
    }
  };

  const layout = getDoorLayout();
  const doorSize = Math.min((width - 40) / Math.max(...layout.rows) - 20, layout.doorSize);

  console.log('🚪 Layout calculated:', layout);
  console.log('📏 Door size calculated:', doorSize);

  // Game state
  const [gameStage, setGameStage] = useState<GameStage>('selection');
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedDoors, setRevealedDoors] = useState<number[]>([]);
  const [prizeLocation] = useState<number>(() => {
    const location = Math.floor(Math.random() * doorCount) + 1;
    console.log('🎁 Prize location set to door:', location, 'out of', doorCount, 'doors');
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

  const getInstructions = (): string => {
    switch (gameStage) {
      case 'selection':
        return 'Choose a door to start your journey';
      case 'montyReveal':
        if (doorCount === 3) {
          return `You chose Door ${selectedDoor}. Would you like to switch to the other unopened door?`;
        } else {
          return `You chose Door ${selectedDoor}. Would you like to switch to one of the other unopened doors?`;
        }
      case 'finalChoice':
        return `You ${switchedChoice ? 'switched to' : 'stayed with'} Door ${selectedDoor}. Click it to see what you won!`;
      case 'result':
        return gameResult?.message || '';
      default:
        return '';
    }
  };

  const handleDoorClick = (doorNumber: number) => {
    if (gameStage === 'selection') {
      setSelectedDoor(doorNumber);
      
      // For different door counts, reveal different numbers of doors
      let doorsToReveal: number;
      if (doorCount === 3) {
        doorsToReveal = 1; // Traditional Monty Hall: reveal 1 door
      } else {
        doorsToReveal = 1; // For 5+ doors: also reveal only 1 door to make it harder
      }
      
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
      
      // Update statistics
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        stayWins: switchedChoice ? prev.stayWins : prev.stayWins + (won ? 1 : 0),
        switchWins: switchedChoice ? prev.switchWins + (won ? 1 : 0) : prev.switchWins
      }));
      
      // Set result
      const message = won ? 
        `🎉 Congratulations! You won the ${prizeName}!` : 
        '😔 Sorry! Better luck next time!';
      
      setGameResult({ won, message });
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
      
      // Call completion callback
      setTimeout(() => {
        onGameComplete?.(won, switchedChoice);
      }, 1500);
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
      // Find the remaining unopened door(s) and pick one randomly
      const remainingDoors = Array.from({ length: doorCount }, (_, i) => i + 1)
        .filter(num => num !== selectedDoor && !revealedDoors.includes(num));
      
      const newChoice = remainingDoors[Math.floor(Math.random() * remainingDoors.length)];
      setSelectedDoor(newChoice);
    }
    
    setGameStage('finalChoice');
  };

  const resetGame = () => {
    setGameStage('selection');
    setSelectedDoor(null);
    setRevealedDoors([]);
    setSwitchedChoice(false);
    setGameResult(null);
    
    // Reset door animations and states
    doorAnimations.forEach(anim => anim.setValue(0));
    doorStates.current = Array(doorCount).fill(false);
  };

  const getDoorContent = (doorNumber: number): string => {
    const doorIndex = doorNumber - 1;
    if (!doorStates.current[doorIndex]) return '';
    
    if (doorNumber === prizeLocation) {
      return '🎁';
    }
    return '🐐';
  };

  const getDoorColor = (doorNumber: number): string => {
    if (selectedDoor === doorNumber && gameStage !== 'selection') {
      return '#009688'; // Teal for selected
    }
    if (revealedDoors.includes(doorNumber)) {
      return '#666666'; // Gray for revealed
    }
    return '#8D6E63'; // Brown default
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#009688" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{locationName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Content */}
      <View style={styles.gameContainer}>
        <Text style={styles.gameTitle}>{prizeName}</Text>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>{getInstructions()}</Text>
        </View>
        
        {/* Doors */}
        <View style={styles.doorsContainer}>
          {layout.rows.map((doorsInRow, rowIndex) => (
            <View key={rowIndex} style={styles.doorRow}>
              {Array.from({ length: doorsInRow }, (_, colIndex) => {
                const doorNumber = layout.rows.slice(0, rowIndex).reduce((sum, row) => sum + row, 0) + colIndex + 1;
                return (
                  <View key={doorNumber} style={styles.doorContainer}>
                    <TouchableOpacity
                      style={[
                        styles.doorFrame,
                        { 
                          backgroundColor: getDoorColor(doorNumber),
                          width: doorSize,
                          height: doorSize * 1.5,
                        }
                      ]}
                      onPress={() => handleDoorClick(doorNumber)}
                      activeOpacity={0.8}
                    >
                      <Animated.View
                        style={[
                          styles.door,
                          {
                            transform: [{
                              rotateY: doorAnimations[doorNumber - 1].interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '-90deg'],
                              }),
                            }],
                            transformOrigin: 'left',
                          },
                        ]}
                      >
                        <View style={styles.doorKnob} />
                      </Animated.View>
                      
                      <View style={styles.doorContent}>
                        <Text style={[styles.doorContentText, { fontSize: doorSize * 0.3 }]}>
                          {getDoorContent(doorNumber)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.doorLabel}>Door {doorNumber}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {gameStage === 'montyReveal' && (
            <>
              <TouchableOpacity
                style={[styles.gameButton, styles.switchButton]}
                onPress={() => finalChoice(true)}
              >
                <Text style={styles.buttonText}>Switch Doors</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameButton, styles.stayButton]}
                onPress={() => finalChoice(false)}
              >
                <Text style={styles.buttonText}>Stay with Choice</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Result Message */}
        {gameResult && (
          <View style={[
            styles.resultMessage,
            gameResult.won ? styles.success : styles.failure
          ]}>
            <Text style={[
              styles.resultText,
              { color: gameResult.won ? '#4CAF50' : '#F44336' }
            ]}>
              {gameResult.message}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 34, // Same width as back button to center title
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#009688',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#009688',
    marginBottom: 30,
    width: '100%',
  },
  instructions: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  doorsContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  doorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 15,
  },
  doorContainer: {
    alignItems: 'center',
  },
  doorFrame: {
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  door: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#8D6E63',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 15,
    transformOrigin: 'left center',
  },
  doorKnob: {
    width: 12,
    height: 12,
    backgroundColor: '#FFB74D',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F57C00',
  },
  doorContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  doorContentText: {
    // fontSize is now set dynamically based on door size
  },
  doorLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gameButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  switchButton: {
    backgroundColor: '#3F51B5',
  },
  stayButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resultMessage: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  success: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  failure: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});