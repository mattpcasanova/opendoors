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
      console.log('📱 Loading user progress for:', userId);
      
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
        console.log('📱 No user profile found, using defaults');
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

      console.log('📱 Raw data from database:', data);

      // Get today's date in EST
      const todayEST = this.getTodayEST();
      
      console.log('📱 Date calculations:', {
        todayEST: todayEST,
        lastDailyPlayDate: data.last_daily_play_date
      });
      
      // Check if user has played today by comparing last_daily_play_date with today
      let hasPlayedToday = false;
      if (data.last_daily_play_date) {
        // Compare dates in YYYY-MM-DD format
        hasPlayedToday = data.last_daily_play_date === todayEST;
        
        console.log('📅 Date comparison:', { 
          lastDailyPlayDateFromDB: data.last_daily_play_date,
          todayEST: todayEST,
          hasPlayedToday,
          areEqual: data.last_daily_play_date === todayEST
        });
      } else {
        console.log('📅 No last_daily_play_date found, hasPlayedToday = false');
      }

      const progress: UserProgress = {
        gamesUntilBonus: data.games_until_bonus,
        hasPlayedToday,
        lastPlayDate: data.last_daily_play_date,
        bonusPlaysAvailable: data.bonus_plays_available
      };

      console.log('📱 Final progress object:', progress);
      return { data: progress, error: null };
    } catch (error: any) {
      console.error('❌ Error loading user progress:', error);
      return { data: null, error: error.message };
    }
  }

  // Save user progress to database
  async saveUserProgress(userId: string, progress: UserProgress): Promise<{ error: string | null }> {
    try {
      console.log('💾 Saving user progress for:', userId, progress);
      
      const updateData = {
        games_until_bonus: progress.gamesUntilBonus,
        last_daily_play_date: progress.lastPlayDate,
        bonus_plays_available: progress.bonusPlaysAvailable,
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Update data being sent to database:', updateData);
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Error saving user progress:', error);
        return { error: error.message };
      }

      console.log('✅ User progress saved successfully');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error saving user progress:', error);
      return { error: error.message };
    }
  }

  // Update progress after a game is played
  async updateProgressAfterGame(userId: string, won: boolean, usedBonus: boolean = false): Promise<{ error: string | null }> {
    try {
      console.log('🎮 Updating progress after game for:', userId, { won, usedBonus });
      
      // Get current progress first
      const { data: currentProgress, error: loadError } = await this.loadUserProgress(userId);
      if (loadError || !currentProgress) {
        return { error: loadError || 'Failed to load current progress' };
      }

      // Set last play date in EST as YYYY-MM-DD format
      const todayEST = this.getTodayEST();
      
      console.log('🎮 Setting last play date:', {
        todayEST: todayEST
      });

      let newProgress: UserProgress = {
        ...currentProgress,
        hasPlayedToday: true, // This will be recalculated on next load
        lastPlayDate: todayEST // Save as YYYY-MM-DD format for consistency
      };

      if (usedBonus) {
        // Consume bonus play and reset progress
        newProgress.bonusPlaysAvailable = Math.max(0, currentProgress.bonusPlaysAvailable - 1);
        newProgress.gamesUntilBonus = 5; // Reset progress bar
      } else {
        // Normal game progression
        const newGamesUntilBonus = Math.max(0, currentProgress.gamesUntilBonus - 1);
        newProgress.gamesUntilBonus = newGamesUntilBonus;
        
        if (newGamesUntilBonus === 0) {
          newProgress.bonusPlaysAvailable = currentProgress.bonusPlaysAvailable + 1;
        }
      }

      console.log('🎮 New progress to save:', newProgress);

      // Save updated progress
      return await this.saveUserProgress(userId, newProgress);
    } catch (error: any) {
      console.error('❌ Error updating progress after game:', error);
      return { error: error.message };
    }
  }
}

export const userProgressService = new UserProgressService(); 