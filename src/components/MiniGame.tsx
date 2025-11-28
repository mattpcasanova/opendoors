import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants';
import Door from './Door';

interface MiniGameProps {
  onComplete: () => void;
}

type GameState = 'initial' | 'selection' | 'montyReveal' | 'finalChoice' | 'result';

export default function MiniGame({ onComplete }: MiniGameProps) {
  const [gameState, setGameState] = useState<GameState>('initial');
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedDoors, setRevealedDoors] = useState<number[]>([]);
  const [prizeLocation] = useState(() => Math.floor(Math.random() * 3) + 1);
  const [switchedChoice, setSwitchedChoice] = useState(false);
  const [gameResult, setGameResult] = useState<{ won: boolean; message: string } | null>(null);
  const [choiceLocked, setChoiceLocked] = useState(false);

  const openDoor = useCallback((doorNumber: number) => {
    setRevealedDoors(prev => [...prev, doorNumber]);
  }, []);

  const handleDoorClick = (doorNumber: number) => {
    if (gameState === 'selection') {
      setSelectedDoor(doorNumber);
      
      // Always reveal just 1 door to make the game more challenging
      const doorsToReveal = 1;
      
      const availableToReveal = Array.from({ length: 3 }, (_, i) => i + 1)
        .filter(num => num !== doorNumber && num !== prizeLocation);
      
      const doorsToRevealList = availableToReveal
        .sort(() => Math.random() - 0.5)
        .slice(0, doorsToReveal);
      
      setRevealedDoors(doorsToRevealList);
      
      // Animate the doors opening
      setTimeout(() => {
        doorsToRevealList.forEach(door => openDoor(door));
        setGameState('montyReveal');
      }, 1000);
    }
  };

  const handleStayChoice = () => {
    if (gameState === 'montyReveal' && selectedDoor) {
      setSwitchedChoice(false);
      setChoiceLocked(false); // Reset lock when making initial choice
      setGameState('finalChoice');
    }
  };

  const handleSwitchChoice = () => {
    if (gameState === 'montyReveal' && selectedDoor) {
      setSwitchedChoice(true);
      setChoiceLocked(false);

      // For 3-door game, automatically switch to the only other unopened door
      const remainingDoors = Array.from({ length: 3 }, (_, i) => i + 1)
        .filter(num => num !== selectedDoor && !revealedDoors.includes(num));

      if (remainingDoors.length === 1) {
        // Only one door to switch to, select it automatically
        setSelectedDoor(remainingDoors[0]);
      }

      setGameState('finalChoice');
    }
  };

  const handleFinalDoorClick = (doorNumber: number) => {
    if (gameState === 'finalChoice') {
      // Prevent clicks if choice is locked or door is already revealed
      if (choiceLocked || revealedDoors.includes(doorNumber)) {
        return;
      }

      // Only allow clicking the currently selected door (whether stayed or switched)
      if (doorNumber !== selectedDoor) {
        return;
      }

      // Lock the choice immediately to prevent multiple clicks
      setChoiceLocked(true);

      const won = doorNumber === prizeLocation;
      openDoor(doorNumber);

      // Set game stage to result but don't show message yet
      setGameState('result');

      // Reveal all remaining doors after a delay
      setTimeout(() => {
        const allRemainingDoors: number[] = [];
        for (let i = 1; i <= 3; i++) {
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
          '🎉 Congratulations! You won!' :
          '😔 Sorry! Better luck next time!';

        setGameResult({ won, message });
      }, 1500);

      // Auto-complete tutorial after showing result
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const getInstructions = () => {
    switch (gameState) {
      case 'initial':
        return 'Step 1: Choose a door to start!';
      case 'selection':
        return 'Step 1: Choose a door to start!';
      case 'montyReveal':
        return 'Step 2: I revealed a goat. Would you like to switch or stay?';
      case 'finalChoice':
        return `Step 3: You ${switchedChoice ? 'switched to' : 'stayed with'} Door ${selectedDoor}. Click it to reveal!`;
      case 'result':
        return gameResult?.message || 'Opening doors...';
      default:
        return '';
    }
  };

  const isDoorDisabled = (doorNumber: number) => {
    if (gameState === 'result') return true;
    if (gameState === 'montyReveal') return true;
    if (gameState === 'finalChoice' && revealedDoors.includes(doorNumber)) return true;
    return false;
  };

  const getDoorContent = (doorNumber: number) => {
    // Always show icon if door is open
    if (revealedDoors.includes(doorNumber)) {
      return doorNumber === prizeLocation
        ? { type: 'icon' as const, name: 'gift', color: '#FFD700' }
        : { type: 'icon' as const, name: 'close-circle', color: Colors.error };
    }
    return null;
  };

  const isDoorOpen = (doorNumber: number) => {
    return revealedDoors.includes(doorNumber);
  };

  const isDoorSelected = (doorNumber: number) => {
    return selectedDoor === doorNumber;
  };

  const isWinningDoor = (doorNumber: number) => {
    const isWinner = doorNumber === prizeLocation;
    console.log(`🎯 MiniGame: Door ${doorNumber} isWinningDoor=${isWinner} (prizeLocation=${prizeLocation})`);
    return isWinner;
  };

  // Start the game
  useEffect(() => {
    setGameState('selection');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{getInstructions()}</Text>
      
      <View style={styles.doorsContainer}>
        {[1, 2, 3].map((doorNumber) => (
          <View key={doorNumber} style={styles.doorWrapper}>
            <Door
              doorNumber={doorNumber}
              isOpen={isDoorOpen(doorNumber)}
              content={getDoorContent(doorNumber)}
              isSelected={isDoorSelected(doorNumber)}
              onPress={() => {
                if (gameState === 'selection') {
                  handleDoorClick(doorNumber);
                } else if (gameState === 'finalChoice') {
                  handleFinalDoorClick(doorNumber);
                }
              }}
              disabled={isDoorDisabled(doorNumber)}
              isWinningDoor={isWinningDoor(doorNumber)}
              isFinalReveal={gameState === 'result'}
            />
          </View>
        ))}
      </View>

      {/* Switch/Stay Buttons */}
      {gameState === 'montyReveal' && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.gameButton, styles.stayButton]}
            onPress={handleStayChoice}
          >
            <Text style={styles.buttonText}>Stay with Choice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gameButton, styles.switchButton]}
            onPress={handleSwitchChoice}
          >
            <Text style={styles.buttonText}>Switch Doors</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  doorsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  doorWrapper: {
    transform: [{ scale: 0.7 }], // Make doors smaller
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  gameButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stayButton: {
    backgroundColor: Colors.warning,
  },
  switchButton: {
    backgroundColor: Colors.accent,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  door: {
    width: 60,
    height: 80,
    backgroundColor: Colors.doorBrown,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.doorBrownDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedDoor: {
    borderColor: Colors.gold,
    borderWidth: 3,
    shadowColor: Colors.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  revealedDoor: {
    backgroundColor: Colors.gray600,
    borderColor: Colors.gray700,
  },
  winningDoor: {
    backgroundColor: Colors.success,
    borderColor: Colors.successDark,
  },
  losingDoor: {
    backgroundColor: Colors.error,
    borderColor: Colors.errorDark,
  },
  doorNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  doorContent: {
    fontSize: 24,
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
});
