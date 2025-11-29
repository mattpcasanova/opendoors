import { supabase } from './supabase/client';

export interface UserProgress {
  gamesUntilBonus: number;
  hasPlayedToday: boolean;
  lastPlayDate: string | null;
  bonusPlaysAvailable: number;
}

class UserProgressService {
  // Helper function to get today's date in EST as YYYY-MM-DD format
  private getTodayEST(): string {
    const now = new Date();
    const estOffset = -5; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 60 * 1000));
    return estTime.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  // Load user progress from database
  async loadUserProgress(userId: string): Promise<{ data: UserProgress | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('games_until_bonus, last_daily_play_date, bonus_plays_available')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error loading user progress:', error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { 
          data: {
            gamesUntilBonus: 5,
            hasPlayedToday: false,
            lastPlayDate: null,
            bonusPlaysAvailable: 0
          }, 
          error: null 
        };
      }

      // Get today's date in EST
      const todayEST = this.getTodayEST();
      
      // Check if user has played today by comparing last_daily_play_date with today
      let hasPlayedToday = false;
      if (data.last_daily_play_date) {
        // Compare dates in YYYY-MM-DD format
        hasPlayedToday = data.last_daily_play_date === todayEST;
      }

      const progress: UserProgress = {
        gamesUntilBonus: data.games_until_bonus,
        hasPlayedToday,
        lastPlayDate: data.last_daily_play_date,
        bonusPlaysAvailable: data.bonus_plays_available
      };

      return { data: progress, error: null };
    } catch (error: any) {
      console.error('❌ Error loading user progress:', error);
      return { data: null, error: error.message };
    }
  }

  // Save user progress to database
  async saveUserProgress(userId: string, progress: UserProgress): Promise<{ error: string | null }> {
    try {
      const updateData = {
        games_until_bonus: progress.gamesUntilBonus,
        last_daily_play_date: progress.lastPlayDate,
        bonus_plays_available: progress.bonusPlaysAvailable,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Error saving user progress:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ Error saving user progress:', error);
      return { error: error.message };
    }
  }

  // Update progress after a game is played
  async updateProgressAfterGame(userId: string, won: boolean, usedBonus: boolean = false): Promise<{ error: string | null }> {
    try {
      // Get current progress first
      const { data: currentProgress, error: loadError } = await this.loadUserProgress(userId);
      if (loadError || !currentProgress) {
        console.error('❌ Failed to load current progress:', loadError);
        return { error: loadError || 'Failed to load current progress' };
      }

      // Set last play date in EST as YYYY-MM-DD format
      const todayEST = this.getTodayEST();

      let newProgress: UserProgress = {
        ...currentProgress,
        hasPlayedToday: true, // This will be recalculated on next load
        lastPlayDate: todayEST // Save as YYYY-MM-DD format for consistency
      };

      if (usedBonus) {
        // Consume bonus play - bonus games do NOT count towards the 5-game progress
        newProgress.bonusPlaysAvailable = Math.max(0, currentProgress.bonusPlaysAvailable - 1);
        // Keep games_until_bonus unchanged - bonus plays are "free" and don't affect progress
        newProgress.gamesUntilBonus = currentProgress.gamesUntilBonus;
      } else {
        // Normal game progression
        const newGamesUntilBonus = Math.max(0, currentProgress.gamesUntilBonus - 1);
        newProgress.gamesUntilBonus = newGamesUntilBonus;

        if (newGamesUntilBonus === 0) {
          // Award exactly 1 bonus door (don't stack multiple bonuses)
          // Only give bonus if user doesn't already have one
          if (currentProgress.bonusPlaysAvailable === 0) {
            newProgress.bonusPlaysAvailable = 1;
            newProgress.gamesUntilBonus = 5; // Reset progress bar after granting bonus
          } else {
            // User already has a bonus - don't grant another, but reset progress bar
            newProgress.bonusPlaysAvailable = currentProgress.bonusPlaysAvailable;
            newProgress.gamesUntilBonus = 5; // Reset progress bar anyway
          }
        }
      }

      // Save updated progress
      const result = await this.saveUserProgress(userId, newProgress);

      if (result.error) {
        console.error('❌ Failed to save progress:', result.error);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error updating progress after game:', error);
      return { error: error.message };
    }
  }
}

export const userProgressService = new UserProgressService(); 