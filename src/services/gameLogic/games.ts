// src/services/gameLogic/games.ts
import { supabase } from '../supabase/client';

export interface Prize {
  id: string;
  name: string;
  description: string;
  value: number;
  image_url?: string;
  logo_url?: string;
  prize_type: string;
  category?: string;
  company_name?: string;
  address?: string;
  location_name?: string;
  doors: number;
  stock_quantity?: number;
  expires_at?: string;
  is_special?: boolean;
  created_at: string;
}

export interface GameResult {
  id: string;
  user_id: string;
  prize_id: string;
  chosen_door: number;
  winning_door: number;
  revealed_door: number;
  switched: boolean;
  won: boolean;
  game_duration_seconds?: number;
  created_at: string;
}

class GamesService {
  // Get all active games/prizes
  async getActiveGames() {
    try {
      const { data, error } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, category, company_name, address, location_name, doors, stock_quantity, expires_at, is_special, created_at');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching active games:', error);
      return { data: null, error };
    }
  }

  // Get featured/special game (marked as special OR highest value)
  async getFeaturedGame() {
    try {
      // First try to get games marked as special
      const { data: specialGames, error: specialError } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, category, company_name, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
        .eq('is_special', true)
        .order('value', { ascending: false })
        .limit(1);

      if (specialError) throw specialError;

      // If we have a special game, use it
      if (specialGames && specialGames.length > 0) {
        const featuredGame = specialGames[0];
        return { data: featuredGame, error: null };
      }

      // Otherwise, fall back to highest value game
      const { data: highestValueGames, error: valueError } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, category, company_name, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
        .order('value', { ascending: false })
        .limit(1);

      if (valueError) throw valueError;

      const featuredGame = highestValueGames && highestValueGames.length > 0 ? highestValueGames[0] : null;

      return { data: featuredGame, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching featured game:', error);
      return { data: null, error };
    }
  }

  // Get regular games (excluding featured/special games)
  async getRegularGames() {
    try {
      // Get all active games that are NOT marked as special
      const { data: allGames, error: allGamesError } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, category, company_name, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
        .eq('is_special', false)
        .order('created_at', { ascending: false });

      if (allGamesError) throw allGamesError;

      if (!allGames || allGames.length === 0) {
        // If no non-special games, get all games and exclude the featured one
        const { data: allAnyGames, error: anyGamesError } = await supabase
          .from('active_games')
          .select('id, name, description, value, logo_url, image_url, prize_type, category, company_name, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
          .order('created_at', { ascending: false });

        if (anyGamesError) throw anyGamesError;

        if (!allAnyGames || allAnyGames.length <= 1) {
          return { data: [], error: null };
        }

        // Exclude the highest value game (which would be featured)
        const sortedByValue = [...allAnyGames].sort((a, b) => (b.value || 0) - (a.value || 0));
        const regularGames = allAnyGames.filter(game => game.id !== sortedByValue[0].id);

        return { data: regularGames, error: null };
      }

      return { data: allGames, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching regular games:', error);
      return { data: null, error };
    }
  }

  // Record a game result
  async recordGame(gameData: {
    user_id: string;
    prize_id: string;
    chosen_door?: number;
    winning_door?: number;
    revealed_door?: number;
    switched?: boolean;
    won: boolean;
    game_duration_seconds?: number;
  }) {
    try {
      // Insert into game_plays table
      const { error: gameError } = await supabase
        .from('game_plays')
        .insert({
          user_id: gameData.user_id,
          prize_id: gameData.prize_id,
          win: gameData.won,
          chosen_door: gameData.chosen_door,
          winning_door: gameData.winning_door,
          revealed_door: gameData.revealed_door,
          switched: gameData.switched,
          won: gameData.won,
          game_duration_seconds: gameData.game_duration_seconds || 0,
          created_at: new Date().toISOString()
        });

      if (gameError) {
        console.error('❌ Error inserting into game_plays table:', gameError);
        return { error: gameError, data: null };
      }

      // If user won, insert into user_rewards table
      if (gameData.won && gameData.prize_id) {
        // Generate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error: rewardError } = await supabase
          .from('user_rewards')
          .insert({
            user_id: gameData.user_id,
            prize_id: gameData.prize_id,
            qr_code: `QR_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            reward_code: `REWARD_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            expires_at: expiresAt.toISOString().split('T')[0],
            created_at: new Date().toISOString()
          });

        if (rewardError) {
          console.error('❌ Error inserting into user_rewards table:', rewardError);
          // Don't return error here - game was recorded successfully
        }
      }

      return { data: { success: true }, error: null };
    } catch (err) {
      console.error('❌ Unexpected error recording game:', err);
      return { error: err, data: null };
    }
  }

  // Update user stats after game
  async updateUserStats(userId: string, won: boolean, switched: boolean) {
    try {
      // Get current stats
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('total_games, total_wins')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update stats
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          total_games: (profile.total_games || 0) + 1,
          total_wins: (profile.total_wins || 0) + (won ? 1 : 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error: any) {
      console.error('Error updating user stats:', error);
      return { error };
    }
  }

  // Check if user can play daily game
  async canPlayDailyGame(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('daily_plays_remaining, last_free_play_date')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const today = new Date().toDateString();
      const lastPlayDate = data.last_free_play_date ? new Date(data.last_free_play_date).toDateString() : null;

      // Reset daily plays if it's a new day
      if (lastPlayDate !== today) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            daily_plays_remaining: 1,
            last_free_play_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', userId);

        if (updateError) throw updateError;
        return { canPlay: true, error: null };
      }

      return { canPlay: data.daily_plays_remaining > 0, error: null };
    } catch (error: any) {
      console.error('Error checking daily game availability:', error);
      return { canPlay: false, error };
    }
  }

  // Use daily game play
  async useDailyPlay(userId: string) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          daily_plays_remaining: 0,
          last_free_play_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error using daily play:', error);
      return { error };
    }
  }
}

export const gamesService = new GamesService();