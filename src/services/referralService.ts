import { supabase } from './supabase/client';
import { notificationService } from './notificationService';
import { earnedRewardsService } from './earnedRewardsService';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  referred_played_first_game: boolean;
  referrer_rewarded: boolean;
  referred_rewarded: boolean;
  created_at: string;
  first_game_played_at: string | null;
  rewards_granted_at: string | null;
}

class ReferralService {
  /**
   * Generate or get user's referral code
   */
  async getUserReferralCode(userId: string): Promise<string | null> {
    try {
      console.log('🔍 Getting referral code for user:', userId);

      // Check if user already has a referral code
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      console.log('📋 Existing referral code:', profile?.referral_code, 'Error:', fetchError);

      if (profile?.referral_code) {
        console.log('✅ Using existing referral code:', profile.referral_code);
        return profile.referral_code;
      }

      // Generate a unique referral code (user ID shortened + random)
      const baseCode = userId.substring(0, 8).toUpperCase();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const referralCode = `REF${baseCode}${randomSuffix}`;

      console.log('📎 Generated new referral code:', referralCode);

      // Save to user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ referral_code: referralCode })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error saving referral code:', error);
        return null;
      }

      console.log('✅ Referral code saved successfully');
      return referralCode;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  }

  /**
   * Create referral relationship when user signs up with referral code
   */
  async createReferral(referrerCode: string, referredUserId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🔍 Looking up referrer with code:', referrerCode);

      // Find referrer by code using RPC function (bypasses RLS for unauthenticated users)
      const { data: referrerData, error: findError } = await supabase
        .rpc('get_user_id_by_referral_code', { code: referrerCode });

      console.log('📋 Referrer lookup result:', { referrerData, error: findError });

      // Extract the user_id from the result
      const referrerProfile = referrerData && referrerData.length > 0
        ? { id: referrerData[0].user_id }
        : null;

      if (findError || !referrerProfile) {
        console.warn('❌ Referrer not found for code:', referrerCode, 'Error:', findError);
        return { success: false, error: 'Invalid referral code' };
      }

      console.log('✅ Referrer found:', referrerProfile.id);

      const referrerId = referrerProfile.id;

      // Don't allow self-referrals
      if (referrerId === referredUserId) {
        return { success: false, error: 'Cannot refer yourself' };
      }

      // Check if referral already exists
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('referred_id', referredUserId)
        .single();

      if (existing) {
        return { success: true, error: null }; // Already exists, that's fine
      }

      // Create referral record
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredUserId,
          referral_code: referrerCode,
        });

      if (insertError) {
        console.error('Error creating referral:', insertError);
        // Provide clearer error message for constraint violations
        if (insertError.code === '23505' || insertError.message?.includes('unique')) {
          return { 
            success: false, 
            error: 'Referral code constraint error. This should be fixed - please run the migration to allow code reuse.' 
          };
        }
        return { success: false, error: insertError.message };
      }

      // Update user profile with referred_by
      await supabase
        .from('user_profiles')
        .update({ referred_by_id: referrerId })
        .eq('id', referredUserId);

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error creating referral:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if this is user's first game and grant referral rewards if applicable
   */
  async checkAndGrantReferralRewards(userId: string): Promise<{ granted: boolean; error: string | null }> {
    console.log('🎁 ============ REFERRAL REWARD CHECK START ============');
    console.log('🎁 Checking referral rewards for user:', userId);

    try {

      // First, check if this is actually the first game
      const { count: gameCount, error: countError } = await supabase
        .from('game_plays')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      console.log('🎮 Game count for user:', gameCount, 'Error:', countError);

      if (countError) {
        console.warn('⚠️ Error checking game count:', countError);
      }

      // If user has played more than 1 game (this current one), skip referral check
      // We check > 1 because the current game was just recorded
      if (gameCount && gameCount > 1) {
        console.log('⏭️ Skipping referral check - user has already played', gameCount, 'games (not first game)');
        return { granted: false, error: null };
      }

      console.log('✅ This IS the first game (count =', gameCount, ')');

      // Check if user was referred and hasn't played first game yet
      console.log('🔍 Looking for referral record where referred_id =', userId);
      const { data: referral, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', userId)
        .eq('referred_played_first_game', false)
        .single();

      console.log('📋 Referral lookup result:', JSON.stringify({ referral, error: refError }, null, 2));

      if (refError) {
        console.log('❌ Error looking up referral:', refError);
        console.log('❌ Error code:', refError.code);
        console.log('❌ Error message:', refError.message);
        console.log('❌ Error details:', refError.details);
        console.log('❌ Error hint:', refError.hint);
        return { granted: false, error: refError.message };
      }

      if (!referral) {
        console.log('❌ No referral found - user may not have been referred or already rewarded');
        return { granted: false, error: null };
      }

      console.log('✅ Referral found! Processing rewards...');

      // Mark that referred user has played first game
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referred_played_first_game: true,
          first_game_played_at: new Date().toISOString(),
        })
        .eq('id', referral.id);

      if (updateError) {
        console.error('Error updating referral:', updateError);
        return { granted: false, error: updateError.message };
      }

      // Grant rewards to both users
      const referrerId = referral.referrer_id;
      const referredId = referral.referred_id;

      // Get names for notifications
      const { data: referrerProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email')
        .eq('id', referrerId)
        .single();

      const { data: referredProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email')
        .eq('id', referredId)
        .single();

      const referrerName = referrerProfile
        ? (referrerProfile.first_name && referrerProfile.last_name
            ? `${referrerProfile.first_name} ${referrerProfile.last_name}`
            : referrerProfile.email)
        : 'Your friend';

      const referredName = referredProfile
        ? (referredProfile.first_name && referredProfile.last_name
            ? `${referredProfile.first_name} ${referredProfile.last_name}`
            : referredProfile.email)
        : 'Your friend';

      // Grant reward to referrer
      console.log('🎁 Granting reward to REFERRER:', referrerId);
      if (!referral.referrer_rewarded) {
        const referrerRewardResult = await earnedRewardsService.addReferralReward(
          referrerId,
          referredName
        );
        console.log('✅ Referrer reward result:', referrerRewardResult);

        // Create notification for referrer
        const referrerNotifResult = await notificationService.createDoorNotification(
          referrerId,
          'OpenDoors',
          1,
          `Your friend ${referredName} played their first game! You both earned +1 door.`
        );
        console.log('✅ Referrer notification result:', referrerNotifResult);

        // Send push notification only to the referrer (not a local notification)
        // Only send if this is the logged-in user on this device
        if (referrerId === userId) {
          const { pushNotificationService } = await import('./pushNotificationService');
          await pushNotificationService.sendLocalNotification(
            'Referral Reward Earned! 🎉',
            `Your friend ${referredName} played their first game! You both earned +1 door.`,
            { type: 'referral_reward', userId: referrerId, referredName }
          );
        }

        // Mark referrer as rewarded
        await supabase
          .from('referrals')
          .update({ referrer_rewarded: true })
          .eq('id', referral.id);
      }

      // Grant reward to referred user
      console.log('🎁 Granting reward to REFERRED USER:', referredId);
      if (!referral.referred_rewarded) {
        const referredRewardResult = await earnedRewardsService.addReferralReward(
          referredId,
          referrerName
        );
        console.log('✅ Referred user reward result:', referredRewardResult);

        // Create notification for referred user
        const referredNotifResult = await notificationService.createDoorNotification(
          referredId,
          'OpenDoors',
          1,
          `Thanks for joining! You and ${referrerName} both earned +1 door for playing your first game.`
        );
        console.log('✅ Referred user notification result:', referredNotifResult);

        // Send push notification only to the referred user (not a local notification)
        // Only send if this is the logged-in user on this device
        if (referredId === userId) {
          const { pushNotificationService: pushService } = await import('./pushNotificationService');
          await pushService.sendLocalNotification(
            'Referral Reward Earned! 🎉',
            `Thanks for joining! You and ${referrerName} both earned +1 door for playing your first game.`,
            { type: 'referral_reward', userId: referredId, referrerName }
          );
        }

        // Mark referred as rewarded
        await supabase
          .from('referrals')
          .update({
            referred_rewarded: true,
            rewards_granted_at: new Date().toISOString(),
          })
          .eq('id', referral.id);
      }

      return { granted: true, error: null };
    } catch (error: any) {
      console.error('Error granting referral rewards:', error);
      return { granted: false, error: error.message };
    }
  }

  /**
   * Get referral stats for a user
   */
  async getUserReferralStats(userId: string): Promise<{
    totalReferred: number;
    completedReferrals: number;
    pendingReferrals: number;
  }> {
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('referred_played_first_game')
        .eq('referrer_id', userId);

      if (error) {
        return { totalReferred: 0, completedReferrals: 0, pendingReferrals: 0 };
      }

      const total = referrals?.length || 0;
      const completed = referrals?.filter(r => r.referred_played_first_game).length || 0;
      const pending = total - completed;

      return {
        totalReferred: total,
        completedReferrals: completed,
        pendingReferrals: pending,
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return { totalReferred: 0, completedReferrals: 0, pendingReferrals: 0 };
    }
  }
}

export const referralService = new ReferralService();

