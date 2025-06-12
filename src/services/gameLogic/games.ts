// src/services/gameLogic/games.ts
import { supabase } from '../../lib/supabase';

export interface Prize {
  id: string;
  name: string;
  description: string;
  value: number;
  image_url?: string;
  prize_type: string;
  address?: string;
  location_name?: string;
  doors: number;
  stock_quantity?: number;
  expires_at?: string;
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
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🎮 All active games result:', { data, error, count: data?.length });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching active games:', error);
      return { data: null, error };
    }
  }

  // Get featured/special game (highest value or marked as featured)
  async getFeaturedGame() {
    try {
      console.log('⭐ Fetching featured game...');
      
      const { data, error } = await supabase
        .from('active_games')
        .select('*')
        .order('value', { ascending: false })
        .limit(1);

      // Return the first item or null if no results
      const featuredGame = data && data.length > 0 ? data[0] : null;
      
      console.log('⭐ Featured game result:', { 
        featuredGame: featuredGame?.name, 
        value: featuredGame?.value,
        error 
      });

      if (error) throw error;
      return { data: featuredGame, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching featured game:', error);
      return { data: null, error };
    }
  }

  // Get regular games (excluding featured) - FIXED VERSION
  async getRegularGames() {
    try {
      console.log('📋 Fetching regular games...');
      
      // Get all active games first
      const { data: allGames, error: allGamesError } = await supabase
        .from('active_games')
        .select('*')
        .order('created_at', { ascending: false });

      if (allGamesError) throw allGamesError;
      
      console.log('📋 All games fetched:', allGames?.length);

      if (!allGames || allGames.length === 0) {
        return { data: [], error: null };
      }

      // If we have 4 or fewer games, show all as regular games (no featured)
      if (allGames.length <= 4) {
        console.log('📋 Showing all games as regular (4 or fewer total)');
        return { data: allGames, error: null };
      }

      // If we have more than 4 games, exclude the highest value one as featured
      const sortedByValue = [...allGames].sort((a, b) => (b.value || 0) - (a.value || 0));
      const featuredGame = sortedByValue[0];
      const regularGames = allGames.filter(game => game.id !== featuredGame.id);
      
      console.log('📋 Regular games result:', { 
        total: allGames.length,
        featured: featuredGame.name,
        regular: regularGames.length 
      });

      return { data: regularGames, error: null };
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
      const { data, error } = await supabase
        .from('games')
        .insert([gameData])
        .select()
        .single();

      if (error) throw error;

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
          console.error('Error creating user prize:', prizeError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error recording game:', error);
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