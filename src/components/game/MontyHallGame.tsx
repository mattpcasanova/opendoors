import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useMontyHallGame } from '../../hooks/useMontyHallGame';
import Door from '../Door';
import GameStats from '../GameStats';

export default function MontyHallGame() {
  const {
    gameState,
    gameStats,
    handleDoorClick,
    handleDecision,
    resetGame,
    getInstructions
  } = useMontyHallGame();

  return (
    <View style={{ flex: 1 }}>
      {/* Instructions */}
      <View style={{
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#009688',
        marginBottom: 30
      }}>
        <Text style={{
          fontSize: 14,
          color: '#333',
          textAlign: 'center'
        }}>
          {getInstructions()}
        </Text>
      </View>
      
      {/* Doors */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
      }}>
        <Door 
          doorNumber={1} 
          isOpen={gameState.revealedDoor === 1 || (gameState.stage === 'result')}
          content={gameState.prizeLocation === 1 ? '🎁' : '🐐'}
          isSelected={gameState.selectedDoor === 1}
          onPress={() => handleDoorClick(1)}
          disabled={gameState.stage === 'montyReveal' || (gameState.stage === 'finalChoice' && gameState.selectedDoor !== 1)}
        />
        <Door 
          doorNumber={2} 
          isOpen={gameState.revealedDoor === 2 || (gameState.stage === 'result')}
          content={gameState.prizeLocation === 2 ? '🎁' : '🐐'}
          isSelected={gameState.selectedDoor === 2}
          onPress={() => handleDoorClick(2)}
          disabled={gameState.stage === 'montyReveal' || (gameState.stage === 'finalChoice' && gameState.selectedDoor !== 2)}
        />
        <Door 
          doorNumber={3} 
          isOpen={gameState.revealedDoor === 3 || (gameState.stage === 'result')}
          content={gameState.prizeLocation === 3 ? '🎁' : '🐐'}
          isSelected={gameState.selectedDoor === 3}
          onPress={() => handleDoorClick(3)}
          disabled={gameState.stage === 'montyReveal' || (gameState.stage === 'finalChoice' && gameState.selectedDoor !== 3)}
        />
      </View>
      
      {/* Game Buttons */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {gameState.stage === 'montyReveal' && (
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#3F51B5',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 25,
                minWidth: 120
              }}
              onPress={() => handleDecision(true)}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 14, 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Switch Doors
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#FF9800',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 25,
                minWidth: 120
              }}
              onPress={() => handleDecision(false)}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 14, 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Stay with Choice
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {gameState.stage === 'result' && (
          <TouchableOpacity
            style={{
              backgroundColor: '#009688',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 25
            }}
            onPress={resetGame}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              Play Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Result Message */}
      {gameState.stage === 'result' && (
        <View style={{
          backgroundColor: gameState.gameResult === 'win' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          borderWidth: 2,
          borderColor: gameState.gameResult === 'win' ? '#4CAF50' : '#F44336',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <Text style={{
            color: gameState.gameResult === 'win' ? '#4CAF50' : '#F44336',
            fontSize: 18,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {getInstructions()}
          </Text>
        </View>
      )}
      
      {/* Statistics */}
      <GameStats stats={gameStats} />
    </View>
  );
}