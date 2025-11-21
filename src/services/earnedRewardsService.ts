import { supabase } from './supabase/client';

export interface EarnedReward {
  id: string;
  user_id: string;
  doors_earned: number;
  source_type: 'ad_watch' | 'referral' | 'distributor' | 'achievement' | 'lesson' | 'survey';
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
  source_type: EarnedReward['source_type'];
  source_name: string;
  description?: string;
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

      return { data: data as EarnedReward[] | null, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch earned rewards' };
    }
  }

  async getUnclaimedDoorsCount(userId: string): Promise<{ count: number; error: string | null }> {
    try {
      const { count, error } = await supabase
        .from('earned_rewards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('claimed', false);

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      return { count: 0, error: 'Failed to fetch unclaimed doors count' };
    }
  }

  // Add a new earned reward via RPC (SECURITY DEFINER)
  async addEarnedReward(userId: string, rewardData: CreateEarnedRewardData): Promise<{ data: EarnedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('add_earned_reward', {
        p_user_id: userId,
        p_source_type: rewardData.source_type,
        p_source_name: rewardData.source_name,
        p_description: rewardData.description || null,
        p_doors_earned: rewardData.doors_earned || 1,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as EarnedReward, error: null };
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
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as EarnedReward, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to get next unclaimed reward' };
    }
  }

  // Helper function to get today's date in EST as YYYY-MM-DD format
  private getTodayEST(): string {
    const now = new Date();
    const estOffset = -5; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 60 * 1000));
    return estTime.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  // Check how many ads the user has watched today and if they can watch more
  async getAdWatchesRemaining(userId: string): Promise<{ remaining: number; total: number; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('ads_watched_today, last_ad_watch_date')
        .eq('id', userId)
        .single();

      if (error) {
        return { remaining: 0, total: 3, error: error.message };
      }

      const todayEST = this.getTodayEST();
      const maxAdsPerDay = 3;

      // If last watch date is different from today, user has 3 ads available
      if (!data.last_ad_watch_date || data.last_ad_watch_date !== todayEST) {
        return { remaining: maxAdsPerDay, total: maxAdsPerDay, error: null };
      }

      // Otherwise, calculate remaining based on today's watches
      const adsWatchedToday = data.ads_watched_today || 0;
      const remaining = Math.max(0, maxAdsPerDay - adsWatchedToday);

      return { remaining, total: maxAdsPerDay, error: null };
    } catch (error) {
      return { remaining: 0, total: 3, error: 'Failed to check ad watch limit' };
    }
  }

  // Convenience wrappers
  async addAdWatchReward(userId: string): Promise<{ data: EarnedReward | null; error: string | null }> {
    try {
      // First, check if user has reached daily limit
      const { remaining, error: checkError } = await this.getAdWatchesRemaining(userId);

      if (checkError) {
        return { data: null, error: checkError };
      }

      if (remaining <= 0) {
        return { data: null, error: 'Daily ad watch limit reached (3 per day)' };
      }

      // Get current ad watch data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('ads_watched_today, last_ad_watch_date')
        .eq('id', userId)
        .single();

      if (profileError) {
        return { data: null, error: profileError.message };
      }

      const todayEST = this.getTodayEST();
      let newAdsWatchedToday = 1;

      // If last watch date is today, increment the count
      if (profileData.last_ad_watch_date === todayEST) {
        newAdsWatchedToday = (profileData.ads_watched_today || 0) + 1;
      }

      // Update the ad watch count and date
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ads_watched_today: newAdsWatchedToday,
          last_ad_watch_date: todayEST,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        return { data: null, error: updateError.message };
      }

      // Add the earned reward
      return this.addEarnedReward(userId, {
        source_type: 'ad_watch',
        source_name: 'Watch Ad',
        description: 'Watched a rewarded ad',
      });
    } catch (error) {
      return { data: null, error: 'Failed to add ad watch reward' };
    }
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

  // Add survey completion reward
  async addSurveyReward(userId: string): Promise<{ data: EarnedReward | null; error: string | null }> {
    return this.addEarnedReward(userId, {
      source_type: 'survey',
      source_name: 'Completing Survey',
      description: 'Completed post-redemption survey',
    });
  }
}

export const earnedRewardsService = new EarnedRewardsService();
