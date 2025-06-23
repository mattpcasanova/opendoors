// src/services/gameLogic/games.ts
import { supabase } from '../../lib/supabase';

export interface Prize {
  id: string;
  name: string;
  description: string;
  value: number;
  image_url?: string;
  logo_url?: string;
  prize_type: string;
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
      console.log('🎮 Fetching all active games...');
      
      const { data, error } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, address, location_name, doors, stock_quantity, expires_at, is_special, created_at');

      console.log('🎮 All active games result:', { data, error, count: data?.length });

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
      console.log('⭐ Fetching featured game...');
      
      // First try to get games marked as special
      const { data: specialGames, error: specialError } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
        .eq('is_special', true)
        .order('value', { ascending: false })
        .limit(1);

      if (specialError) throw specialError;

      // If we have a special game, use it
      if (specialGames && specialGames.length > 0) {
        const featuredGame = specialGames[0];
        console.log('⭐ Found special game:', featuredGame.name);
        return { data: featuredGame, error: null };
      }

      // Otherwise, fall back to highest value game
      const { data: highestValueGames, error: valueError } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
        .order('value', { ascending: false })
        .limit(1);

      if (valueError) throw valueError;

      const featuredGame = highestValueGames && highestValueGames.length > 0 ? highestValueGames[0] : null;
      
      console.log('⭐ Featured game result:', { 
        featuredGame: featuredGame?.name, 
        value: featuredGame?.value,
        isSpecial: featuredGame?.is_special,
        error: null
      });

      return { data: featuredGame, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching featured game:', error);
      return { data: null, error };
    }
  }

  // Get regular games (excluding featured/special games)
  async getRegularGames() {
    try {
      console.log('📋 Fetching regular games...');
      
      // Get all active games that are NOT marked as special
      const { data: allGames, error: allGamesError } = await supabase
        .from('active_games')
        .select('id, name, description, value, logo_url, image_url, prize_type, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
        .eq('is_special', false)
        .order('created_at', { ascending: false });

      if (allGamesError) throw allGamesError;
      
      console.log('📋 Regular games fetched (non-special):', allGames?.length);

      if (!allGames || allGames.length === 0) {
        // If no non-special games, get all games and exclude the featured one
        const { data: allAnyGames, error: anyGamesError } = await supabase
          .from('active_games')
          .select('id, name, description, value, logo_url, image_url, prize_type, address, location_name, doors, stock_quantity, expires_at, is_special, created_at')
          .order('created_at', { ascending: false });

        if (anyGamesError) throw anyGamesError;

        if (!allAnyGames || allAnyGames.length <= 1) {
          return { data: [], error: null };
        }

        // Exclude the highest value game (which would be featured)
        const sortedByValue = [...allAnyGames].sort((a, b) => (b.value || 0) - (a.value || 0));
        const regularGames = allAnyGames.filter(game => game.id !== sortedByValue[0].id);
        
        console.log('📋 Using fallback regular games:', regularGames.length);
        return { data: regularGames, error: null };
      }

      console.log('📋 Regular games result:', { 
        total: allGames.length,
        games: allGames.map(g => g.name)
      });

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
    chosen_door: number;
    winning_door: number;
    revealed_door: number;
    switched: boolean;
    won: boolean;
    game_duration_seconds?: number;
  }) {
    try {
      console.log('🎮 recordGame called with:', gameData);
      const { data, error } = await supabase
        .from('games')
        .insert([gameData])
        .select()
        .single();
      if (error) {
        console.error('❌ Error inserting into games table:', error);
        throw error;
      }
      console.log('✅ Game inserted:', data);
      // If the user won, create a user_prize record
      if (gameData.won) {
        const { error: prizeError } = await supabase
          .from('user_prizes')
          .insert([
            {
              user_id: gameData.user_id,
              game_id: data.id,
              prize_id: gameData.prize_id,
              redemption_status: 'pending',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            },
          ]);
        if (prizeError) {
          console.error('❌ Error creating user prize:', prizeError);
        } else {
          console.log('✅ User prize created for game:', data.id);
        }
      }
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error recording game:', error);
      return { data: null, error };
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