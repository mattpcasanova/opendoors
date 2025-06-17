import { supabase } from '../lib/supabase';

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
      
      // Get total games played and wins
      const { data: gameStats, error: gameError } = await supabase
        .from('user_profiles')
        .select('total_games, total_wins')
        .eq('id', userId)
        .maybeSingle();

      if (gameError) throw gameError;

      // Get total rewards earned and claimed
      const { data: rewardStats, error: rewardError } = await supabase
        .from('user_prizes')
        .select('redemption_status')
        .eq('user_id', userId);

      if (rewardError) throw rewardError;

      const stats: UserStats = {
        gamesPlayed: gameStats?.total_games || 0,
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
}

export const historyService = new HistoryService(); 