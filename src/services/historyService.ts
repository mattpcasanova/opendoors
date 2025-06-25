import { supabase } from '../services/supabase/client';

export interface GameHistory {
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
  prize: {
    name: string;
    description: string;
    location_name: string;
  };
}

export interface UserStats {
  gamesPlayed: number;
  rewardsEarned: number;
  rewardsClaimed: number;
}

export interface GamePlay {
  id: string;
  created_at: string;
  win: boolean;
  prize: {
    name: string;
    location_name: string;
    logo_url?: string;
  };
}

class HistoryService {
  async getUserGameHistory(userId: string) {
    try {
      console.log('📜 Fetching game history for user:', userId);
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          prize:prize_id (
            name,
            description,
            location_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📜 Game history fetched:', data?.length, 'games');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching game history:', error);
      return { data: null, error };
    }
  }

  async getUserStats(userId: string) {
    try {
      console.log('📊 Fetching user stats for:', userId);
      
      // Get total games played from game_plays table
      const { data: gamePlays, error: gameError } = await supabase
        .from('game_plays')
        .select('id')
        .eq('user_id', userId);

      if (gameError) throw gameError;

      // Get total rewards earned and claimed
      const { data: rewardStats, error: rewardError } = await supabase
        .from('user_prizes')
        .select('redemption_status')
        .eq('user_id', userId);

      if (rewardError) throw rewardError;

      const stats: UserStats = {
        gamesPlayed: gamePlays?.length || 0,
        rewardsEarned: rewardStats?.length || 0,
        rewardsClaimed: rewardStats?.filter(r => r.redemption_status === 'claimed').length || 0
      };

      console.log('📊 User stats fetched:', stats);
      return { data: stats, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching user stats:', error);
      return { data: null, error };
    }
  }

  async logGamePlay(rewardId: string, win: boolean) {
    const { data, error } = await supabase
      .from('game_plays')
      .insert([{ reward_id: rewardId, win: win }]);

    if (error) {
      console.error('Error logging game play:', error);
    }

    return { data, error };
  }

  // Get the last 20 games played by the user
  async getUserGamePlays(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_plays')
        .select(`
          *,
          prizes (
            id,
            name,
            description,
            value,
            prize_type,
            location_name,
            logo_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching game plays:', error);
        return { error: error.message, data: null };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { error: 'Failed to fetch game plays', data: null };
    }
  }
}

export const historyService = new HistoryService(); 