import { useState } from 'react';

export interface GameState {
  stage: 'selection' | 'montyReveal' | 'finalChoice' | 'result';
  selectedDoor: number | null;
  revealedDoor: number | null;
  prizeLocation: number;
  switchedChoice: boolean;
  gameResult: 'win' | 'lose' | null;
}

export interface GameStats {
  gamesPlayed: number;
  stayWins: number;
  switchWins: number;
}

export function useMontyHallGame() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'selection',
    selectedDoor: null,
    revealedDoor: null,
    prizeLocation: Math.floor(Math.random() * 3) + 1,
    switchedChoice: false,
    gameResult: null,
  });
  
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    stayWins: 0,
    switchWins: 0,
  });

  const resetGame = () => {
    setGameState({
      stage: 'selection',
      selectedDoor: null,
      revealedDoor: null,
      prizeLocation: Math.floor(Math.random() * 3) + 1,
      switchedChoice: false,
      gameResult: null,
    });
  };

  const handleDoorClick = (doorNumber: number) => {
    if (gameState.stage === 'selection') {
      const newGameState = { ...gameState };
      newGameState.selectedDoor = doorNumber;
      
      let revealedDoor;
      do {
        revealedDoor = Math.floor(Math.random() * 3) + 1;
      } while (revealedDoor === doorNumber || revealedDoor === gameState.prizeLocation);
      
      newGameState.revealedDoor = revealedDoor;
      newGameState.stage = 'montyReveal';
      
      setGameState(newGameState);
    } else if (gameState.stage === 'finalChoice' && doorNumber === gameState.selectedDoor) {
      const won = doorNumber === gameState.prizeLocation;
      const newGameState = { ...gameState };
      newGameState.stage = 'result';
      newGameState.gameResult = won ? 'win' : 'lose';
      
      const newStats = { ...gameStats };
      newStats.gamesPlayed++;
      if (won) {
        if (gameState.switchedChoice) {
          newStats.switchWins++;
        } else {
          newStats.stayWins++;
        }
      }
      
      setGameState(newGameState);
      setGameStats(newStats);
    }
  };

  const handleDecision = (shouldSwitch: boolean) => {
    const newGameState = { ...gameState };
    newGameState.switchedChoice = shouldSwitch;
    
    if (shouldSwitch) {
      const newChoice = [1, 2, 3].find(num => 
        num !== gameState.selectedDoor && num !== gameState.revealedDoor);
      newGameState.selectedDoor = newChoice!;
    }
    
    newGameState.stage = 'finalChoice';
    setGameState(newGameState);
  };

  const getInstructions = () => {
    switch (gameState.stage) {
      case 'selection':
        return 'Choose a door to start your journey';
      case 'montyReveal':
        return `You chose Door ${gameState.selectedDoor}. Would you like to switch to the other unopened door?`;
      case 'finalChoice':
        return `You ${gameState.switchedChoice ? 'switched to' : 'stayed with'} Door ${gameState.selectedDoor}. Click it to see what you won!`;
      case 'result':
        return gameState.gameResult === 'win' 
          ? '🎉 Congratulations! You won the Chick-fil-A Sandwich!' 
          : '😔 Sorry! Better luck next time!';
      default:
        return '';
    }
  };

  return {
    gameState,
    gameStats,
    handleDoorClick,
    handleDecision,
    resetGame,
    getInstructions
  };
}