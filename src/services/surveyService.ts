import { supabase } from '../lib/supabase';
import { SurveyResponses } from '../components/modals/RedemptionSurveyModal';
import { earnedRewardsService } from './earnedRewardsService';

interface SubmitSurveyParams {
  userId: string;
  rewardId: string;
  prizeId: string;
  responses: SurveyResponses;
}

interface SurveyServiceResult<T = any> {
  data: T | null;
  error: Error | null;
}

class SurveyService {
  /**
   * Submit survey responses and grant +1 bonus door
   */
  async submitSurvey({
    userId,
    rewardId,
    prizeId,
    responses,
  }: SubmitSurveyParams): Promise<SurveyServiceResult<{ surveyId: string; doorsGranted: number }>> {
    try {
      console.log('📝 Submitting survey response...', { userId, rewardId, prizeId });

      // Use RPC function to submit survey and grant bonus door (bypasses RLS)
      const { data: surveyId, error: surveyError } = await supabase
        .rpc('submit_redemption_survey', {
          p_user_id: userId,
          p_reward_id: rewardId,
          p_prize_id: prizeId,
          p_made_purchase: responses.made_purchase,
          p_spend_amount: responses.spend_amount || null,
          p_will_return: responses.will_return,
          p_discovery_source: responses.discovery_source || null,
        });

      if (surveyError) {
        console.error('❌ Error submitting survey:', surveyError);
        return { data: null, error: surveyError };
      }

      console.log('✅ Survey response saved! Survey ID:', surveyId);

      // Add to earned rewards history (this creates a claimable reward)
      const { data: earnedReward, error: earnedRewardError } = await earnedRewardsService.addSurveyReward(userId);
      if (earnedRewardError) {
        console.error('❌ Error adding survey to earned rewards:', earnedRewardError);
        return { data: null, error: new Error(earnedRewardError) };
      }

      console.log('✅ Earned reward created:', earnedReward?.id);

      // Track analytics event
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'survey_completed',
        event_data: {
          survey_id: surveyId,
          reward_id: rewardId,
          prize_id: prizeId,
          made_purchase: responses.made_purchase,
          will_return: responses.will_return,
        },
      });

      return {
        data: {
          surveyId: surveyId,
          doorsGranted: 1,
          earnedRewardId: earnedReward?.id,
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ Unexpected error in submitSurvey:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Check if user has already submitted survey for this reward
   */
  async hasSurveyForReward(
    userId: string,
    rewardId: string
  ): Promise<SurveyServiceResult<boolean>> {
    try {
      const { data, error } = await supabase
        .from('redemption_surveys')
        .select('id')
        .eq('user_id', userId)
        .eq('reward_id', rewardId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (expected if no survey exists)
        console.error('❌ Error checking survey:', error);
        return { data: null, error };
      }

      return { data: !!data, error: null };
    } catch (error) {
      console.error('❌ Unexpected error in hasSurveyForReward:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Get user's survey history
   */
  async getUserSurveys(userId: string): Promise<SurveyServiceResult<any[]>> {
    try {
      const { data, error } = await supabase
        .from('redemption_surveys')
        .select(`
          *,
          prize:prize_id (
            name,
            location_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user surveys:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Unexpected error in getUserSurveys:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Get survey completion rate (for analytics)
   */
  async getSurveyCompletionRate(): Promise<SurveyServiceResult<{ rate: number; total: number; completed: number }>> {
    try {
      // Get total rewards claimed
      const { data: totalRewards, error: totalError } = await supabase
        .from('user_rewards')
        .select('id', { count: 'exact', head: true })
        .eq('claimed', true);

      if (totalError) {
        console.error('❌ Error fetching total rewards:', totalError);
        return { data: null, error: totalError };
      }

      // Get total surveys completed
      const { data: totalSurveys, error: surveysError } = await supabase
        .from('redemption_surveys')
        .select('id', { count: 'exact', head: true });

      if (surveysError) {
        console.error('❌ Error fetching total surveys:', surveysError);
        return { data: null, error: surveysError };
      }

      const total = totalRewards?.length || 0;
      const completed = totalSurveys?.length || 0;
      const rate = total > 0 ? (completed / total) * 100 : 0;

      return {
        data: { rate, total, completed },
        error: null,
      };
    } catch (error) {
      console.error('❌ Unexpected error in getSurveyCompletionRate:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}

export const surveyService = new SurveyService();
