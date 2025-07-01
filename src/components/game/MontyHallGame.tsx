import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMontyHallGame } from '../../hooks/useMontyHallGame';
import Door from '../Door';

interface Props {
  onGameComplete?: (won: boolean, switched: boolean) => void;
  numDoors?: number;
}

export default function MontyHallGame({ onGameComplete, numDoors = 3 }: Props) {
  const { doors, gameState, handleDoorClick, initializeGame, resetGame, getResult } = useMontyHallGame({ numDoors });

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState === 'final') {
      const result = getResult();
      if (result !== null) {
        const switched = doors.findIndex(door => door.isSelected) !== doors.findIndex((door, i) => door.isSelected && i === 0);
        onGameComplete?.(result, switched);
      }
    }
  }, [gameState, getResult, doors, onGameComplete]);

  const handleDoorPress = useCallback((doorIndex: number) => {
    // Prevent multiple rapid clicks
    requestAnimationFrame(() => {
      handleDoorClick(doorIndex);
    });
  }, [handleDoorClick]);

  const getMessage = () => {
    switch (gameState) {
      case 'initial':
        return 'Choose a door to start!';
      case 'decision':
        return 'Would you like to switch your choice? Click any unopened door.';
      case 'final':
        const result = getResult();
        return result ? '🎉 Congratulations! You won!' : '😔 Better luck next time!';
      default:
        return '';
    }
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
              disabled={gameState === 'final' || (gameState === 'decision' && door.isOpen)}
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 