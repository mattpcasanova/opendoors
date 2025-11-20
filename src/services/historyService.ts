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

interface PrizeData {
  id: string;
  name: string;
  description: string;
  location_name: string;
  logo_url?: string;
}

interface SupabaseGamePlay {
  id: string;
  created_at: string;
  win: boolean;
  prize: PrizeData | null;
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
        .from('game_plays')
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

      // Get total rewards earned and claimed from user_rewards table
      const { data: rewardStats, error: rewardError } = await supabase
        .from('user_rewards')
        .select('claimed_at')
        .eq('user_id', userId);

      if (rewardError) throw rewardError;

      const stats: UserStats = {
        gamesPlayed: gamePlays?.length || 0,
        rewardsEarned: rewardStats?.length || 0,
        rewardsClaimed: rewardStats?.filter(r => r.claimed_at).length || 0
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
      // First get game plays
      const { data: gamePlays, error: gamePlaysError } = await supabase
        .from('game_plays')
        .select(`
          id,
          created_at,
          win,
          prize_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (gamePlaysError) {
        console.error('Error fetching game plays:', gamePlaysError);
        return { error: gamePlaysError.message, data: null };
      }

      if (!gamePlays || gamePlays.length === 0) {
        return { data: [], error: null };
      }

      // Then get prizes for all prize_ids
      const prizeIds = gamePlays.map(gp => gp.prize_id);
      const { data: prizes, error: prizesError } = await supabase
        .from('prizes')
        .select(`
          id,
          name,
          description,
          location_name,
          logo_url
        `)
        .in('id', prizeIds);

      if (prizesError) {
        console.error('Error fetching prizes:', prizesError);
        return { error: prizesError.message, data: null };
      }

      // Create a map of prizes by id for quick lookup
      const prizesMap = new Map(prizes?.map(prize => [prize.id, prize]) || []);

      // Map the response to include the prize data correctly
      const mappedData = gamePlays.map(gp => ({
        id: gp.id,
        created_at: gp.created_at,
        win: gp.win,
        prize: {
          name: prizesMap.get(gp.prize_id)?.name || 'Unknown Prize',
          location_name: prizesMap.get(gp.prize_id)?.location_name || 'Unknown Location',
          logo_url: prizesMap.get(gp.prize_id)?.logo_url
        }
      }));

      return { data: mappedData, error: null };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { error: 'Failed to fetch game plays', data: null };
    }
  }
}

export const historyService = new HistoryService(); 