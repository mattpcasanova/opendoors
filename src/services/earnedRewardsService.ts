import { supabase } from './supabase/client';

export interface EarnedReward {
  id: string;
  user_id: string;
  doors_earned: number;
  source_type: 'ad_watch' | 'referral' | 'distributor' | 'achievement' | 'lesson';
  source_name: string;
  description: string;
  claimed: boolean;
  claimed_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEarnedRewardData {
  doors_earned?: number;
  source_type: 'ad_watch' | 'referral' | 'distributor' | 'achievement' | 'lesson';
  source_name: string;
  description: string;
}

class EarnedRewardsService {
  // Get all earned rewards for a user
  async getUserEarnedRewards(userId: string): Promise<{ data: EarnedReward[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('earned_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch earned rewards' };
    }
  }

  // Get unclaimed earned rewards count for a user
  async getUnclaimedDoorsCount(userId: string): Promise<{ count: number; error: string | null }> {
    try {
      const { count, error } = await supabase
        .from('earned_rewards')
        .select('doors_earned', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('claimed', false)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      return { count: 0, error: 'Failed to fetch unclaimed doors count' };
    }
  }

  // Add a new earned reward
  async addEarnedReward(userId: string, rewardData: CreateEarnedRewardData): Promise<{ data: EarnedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('earned_rewards')
        .insert({
          user_id: userId,
          doors_earned: rewardData.doors_earned || 1,
          source_type: rewardData.source_type,
          source_name: rewardData.source_name,
          description: rewardData.description,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to add earned reward' };
    }
  }

  // Claim an earned reward (mark as claimed)
  async claimEarnedReward(rewardId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('earned_rewards')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq('id', rewardId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to claim earned reward' };
    }
  }

  // Get the next unclaimed reward to use (for priority system)
  async getNextUnclaimedReward(userId: string): Promise<{ data: EarnedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('earned_rewards')
        .select('*')
        .eq('user_id', userId)
        .eq('claimed', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to get next unclaimed reward' };
    }
  }

  // Add ad watch reward
  async addAdWatchReward(userId: string): Promise<{ data: EarnedReward | null; error: string | null }> {
    return this.addEarnedReward(userId, {
      source_type: 'ad_watch',
      source_name: 'Ad Watch',
      description: 'Watched 30-second advertisement',
    });
  }

  // Add referral reward
  async addReferralReward(userId: string, referredUserName?: string): Promise<{ data: EarnedReward | null; error: string | null }> {
    return this.addEarnedReward(userId, {
      source_type: 'referral',
      source_name: 'Refer Friend',
      description: referredUserName 
        ? `Successfully referred ${referredUserName} who played their first game`
        : 'Successfully referred a friend who played their first game',
    });
  }

  // Add distributor reward
  async addDistributorReward(
    userId: string, 
    distributorName: string, 
    description: string,
    doorsEarned: number = 1
  ): Promise<{ data: EarnedReward | null; error: string | null }> {
    return this.addEarnedReward(userId, {
      doors_earned: doorsEarned,
      source_type: 'distributor',
      source_name: distributorName,
      description: description,
    });
  }
}

export const earnedRewardsService = new EarnedRewardsService();
