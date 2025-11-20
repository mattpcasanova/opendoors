import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMontyHallGame } from '../../hooks/useMontyHallGame';
import Door from '../Door';
import { soundService } from '../../services/soundService';

interface Props {
  onGameComplete?: (won: boolean, switched: boolean) => void;
  numDoors?: number;
}

export default function MontyHallGame({ onGameComplete, numDoors = 3 }: Props) {
  const { doors, gameState, handleDoorClick, initializeGame, resetGame, getResult } = useMontyHallGame({ numDoors });
  const [showFinalMessage, setShowFinalMessage] = React.useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState === 'final') {
      console.log('🎮 Game state is FINAL - starting 2 second delay before showing result');
      // Delay showing the final message to allow door opening animation to complete
      setTimeout(() => {
        setShowFinalMessage(true);
        const result = getResult();
        console.log(`🎮 Final message showing! Result: ${result ? 'WIN' : 'LOSE'}`);

        // Play celebration or loss sound when showing the final message
        if (result !== null) {
          if (result) {
            console.log('🎉 Playing CELEBRATION sound');
            soundService.playCelebration();
          } else {
            console.log('😔 Playing LOSS sound');
            soundService.playLoss();
          }

          const switched = doors.findIndex(door => door.isSelected) !== doors.findIndex((door, i) => door.isSelected && i === 0);
          onGameComplete?.(result, switched);
        }
      }, 2000); // 2 second delay for door opening animation
    } else {
      setShowFinalMessage(false);
    }
  }, [gameState, getResult, doors, onGameComplete]);

  const handleDoorPress = useCallback((doorIndex: number) => {
    // Prevent multiple rapid clicks during reveal phase
    if (gameState === 'reveal') {
      return;
    }
    
    requestAnimationFrame(() => {
      handleDoorClick(doorIndex);
    });
  }, [handleDoorClick, gameState]);

  const getMessage = () => {
    switch (gameState) {
      case 'initial':
        return 'Choose a door to start!';
      case 'reveal':
        return 'Watch as some doors are revealed...';
      case 'decision':
        return 'Would you like to switch your choice? Click any unopened door.';
      case 'final':
        if (showFinalMessage) {
          const result = getResult();
          return result ? '🎉 Congratulations! You won!' : '😔 Better luck next time!';
        }
        return 'Opening doors...';
      default:
        return '';
    }
  };

  const isDoorDisabled = (doorIndex: number) => {
    if (gameState === 'final') return true;
    if (gameState === 'reveal') return true;
    if (gameState === 'decision' && doors[doorIndex].isOpen) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{getMessage()}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.doorsContainer}>
          {doors.map((door, index) => (
            <Door
              key={index}
              doorNumber={index + 1}
              isOpen={door.isOpen}
              content={door.content}
              isSelected={door.isSelected}
              onPress={() => handleDoorPress(index)}
              disabled={isDoorDisabled(index)}
              isWinningDoor={door.isWinningDoor}
              isFinalReveal={gameState === 'final'}
            />
          ))}
        </View>
      </ScrollView>

      {gameState === 'final' && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetGame}
        >
          <Text style={styles.resetButtonText}>Play Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
    minHeight: 25, // Prevent layout jump during state changes
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  doorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: '#009688',
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 