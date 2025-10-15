import { supabase } from './supabase/client';

class TutorialService {
  /**
   * Check if user has completed the tutorial
   */
  async hasCompletedTutorial(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('tutorial_completed')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking tutorial status:', error);
        return false; // Default to showing tutorial if error
      }

      return data?.tutorial_completed || false;
    } catch (error) {
      console.error('Error checking tutorial status:', error);
      return false;
    }
  }

  /**
   * Mark tutorial as completed for user
   */
  async markTutorialCompleted(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ tutorial_completed: true })
        .eq('id', userId);

      if (error) {
        console.error('Error marking tutorial as completed:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking tutorial as completed:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Reset tutorial status (for testing purposes)
   */
  async resetTutorialStatus(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ tutorial_completed: false })
        .eq('id', userId);

      if (error) {
        console.error('Error resetting tutorial status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error resetting tutorial status:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export const tutorialService = new TutorialService();
