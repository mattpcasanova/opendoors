import { useCallback, useState } from 'react';

type GameState = 'initial' | 'reveal' | 'decision' | 'final';

export interface Door {
  content: string;
  isOpen: boolean;
  isSelected: boolean;
}

interface Props {
  numDoors?: number;
}

export const useMontyHallGame = ({ numDoors = 3 }: Props = {}) => {
  const [doors, setDoors] = useState<Door[]>(Array(numDoors).fill({
    content: '🎁',
    isOpen: false,
    isSelected: false,
  }));
  const [gameState, setGameState] = useState<GameState>('initial');
  const [winningDoorIndex, setWinningDoorIndex] = useState<number>(-1);
  const [initialChoice, setInitialChoice] = useState<number>(-1);
  const [revealedDoorIndices, setRevealedDoorIndices] = useState<number[]>([]);

  const resetGame = useCallback(() => {
    setDoors(Array(numDoors).fill({
      content: '🎁',
      isOpen: false,
      isSelected: false,
    }));
    setGameState('initial');
    setWinningDoorIndex(-1);
    setInitialChoice(-1);
    setRevealedDoorIndices([]);
  }, [numDoors]);

  const initializeGame = useCallback(() => {
    // Set winning door
    const winningDoor = Math.floor(Math.random() * numDoors);
    setWinningDoorIndex(winningDoor);
    
    // Update door contents
    setDoors(prev => prev.map((door, index) => ({
      ...door,
      content: index === winningDoor ? '🏆' : '❌'
    })));
  }, [numDoors]);

  // Enhanced door opening with staggered animation
  const openDoorsWithDelay = useCallback((doorIndices: number[], delay: number = 200) => {
    doorIndices.forEach((doorIndex, i) => {
      setTimeout(() => {
        setDoors(prev => prev.map((door, idx) => 
          idx === doorIndex ? { ...door, isOpen: true } : door
        ));
      }, i * delay);
    });
  }, []);

  const handleDoorClick = useCallback((doorIndex: number) => {
    if (gameState === 'initial') {
      // First door selection
      setInitialChoice(doorIndex);
      setDoors(prev => prev.map((door, i) => ({
        ...door,
        isSelected: i === doorIndex
      })));
      
      // Find doors to reveal (not the selected one and not the winning one)
      const availableDoors = Array.from({ length: numDoors }, (_, i) => i)
        .filter(i => i !== doorIndex && i !== winningDoorIndex);
      
      // Reveal all but one door (leaving the winning door and one other door)
      const numDoorsToReveal = numDoors - 2; // Leave selected door and one other
      const doorsToReveal: number[] = [];
      
      // Randomly select doors to reveal
      while (doorsToReveal.length < numDoorsToReveal) {
        const randomIndex = Math.floor(Math.random() * availableDoors.length);
        const doorToReveal = availableDoors[randomIndex];
        doorsToReveal.push(doorToReveal);
        availableDoors.splice(randomIndex, 1);
      }
      
      setRevealedDoorIndices(doorsToReveal);
      
      // Change to reveal state first
      setGameState('reveal');
      
      // Open doors with staggered animation for more natural feel
      openDoorsWithDelay(doorsToReveal, 250);
      
      // Move to decision state after all doors are revealed
      setTimeout(() => {
        setGameState('decision');
      }, doorsToReveal.length * 250 + 300);
      
    } else if (gameState === 'decision') {
      // Handle door click during decision phase
      if (revealedDoorIndices.includes(doorIndex)) {
        return; // Can't select a revealed door
      }
      
      // Update selection first
      setDoors(prev => prev.map((door, i) => ({
        ...door,
        isSelected: i === doorIndex
      })));
      
      // Move to final state
      setGameState('final');
      
      // Open remaining doors with staggered animation
      const remainingDoors = Array.from({ length: numDoors }, (_, i) => i)
        .filter(i => !revealedDoorIndices.includes(i) && !doors[i].isOpen);
      
      openDoorsWithDelay(remainingDoors, 300);
    }
  }, [gameState, winningDoorIndex, revealedDoorIndices, numDoors, doors, openDoorsWithDelay]);

  const getResult = useCallback(() => {
    if (gameState !== 'final') return null;
    const finalChoice = doors.findIndex(door => door.isSelected);
    return finalChoice === winningDoorIndex;
  }, [doors, gameState, winningDoorIndex]);

  return {
    doors,
    gameState,
    handleDoorClick,
    initializeGame,
    resetGame,
    getResult,
  };
};