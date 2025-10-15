import { useEffect, useState } from 'react';
import { tutorialService } from '../services/tutorialService';
import { useAuth } from './useAuth';

export const useTutorial = () => {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, [user]);

  const checkTutorialStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const hasCompleted = await tutorialService.hasCompletedTutorial(user.id);
      setShowTutorial(!hasCompleted);
    } catch (error) {
      console.error('Error checking tutorial status:', error);
      // Default to showing tutorial if there's an error
      setShowTutorial(true);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTutorial = async () => {
    if (!user?.id) return;

    try {
      const result = await tutorialService.markTutorialCompleted(user.id);
      if (result.success) {
        setShowTutorial(false);
      } else {
        console.error('Failed to mark tutorial as completed:', result.error);
      }
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  };

  const skipTutorial = async () => {
    if (!user?.id) return;

    try {
      const result = await tutorialService.markTutorialCompleted(user.id);
      if (result.success) {
        setShowTutorial(false);
      } else {
        console.error('Failed to skip tutorial:', result.error);
      }
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  const resetTutorial = async () => {
    if (!user?.id) return;

    try {
      const result = await tutorialService.resetTutorialStatus(user.id);
      if (result.success) {
        setShowTutorial(true);
      } else {
        console.error('Failed to reset tutorial:', result.error);
      }
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  };

  return {
    showTutorial,
    isLoading,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};
