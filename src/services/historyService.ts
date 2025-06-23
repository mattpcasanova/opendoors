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
  async getUserGamePlays(userId: string): Promise<{ data: GamePlay[] | null; error: string | null }> {
    try {
      console.log('🎮 Fetching game plays for user:', userId);
      
      const { data, error } = await supabase
        .from('game_plays')
        .select(`
          id,
          created_at,
          win,
          prizes (
            name,
            location_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching game plays:', error);
        return { data: null, error: error.message };
      }

      console.log('�� Game plays fetched:', data?.length, 'games');

      // Transform the data to match our GamePlay interface
      const gamePlays: GamePlay[] = (data || []).map((gamePlay: any) => ({
        id: gamePlay.id,
        created_at: gamePlay.created_at,
        win: gamePlay.win,
        prize: {
          name: gamePlay.prizes?.name || 'Unknown Prize',
          location_name: gamePlay.prizes?.location_name || 'Unknown Location'
        }
      }));

      return { data: gamePlays, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching game plays:', error);
      return { data: null, error: error.message };
    }
  }
}

export const historyService = new HistoryService(); 