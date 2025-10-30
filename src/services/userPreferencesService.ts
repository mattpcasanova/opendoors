import { supabase } from './supabase/client';

export const userPreferencesService = {
  async hasCompletedSurvey(userId: string): Promise<boolean> {
    console.log('🔍 hasCompletedSurvey called for user:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('has_completed_survey')
      .eq('id', userId)
      .single();
    
    console.log('🔍 Database query result:', { data, error });
    
    if (error) {
      if ((error as any).code === 'PGRST116') {
        console.log('🔍 No user profile found.');
        return false;
      }
      console.error('❌ Error querying user_profiles:', error);
      return false;
    }
    
    if (!data) {
      console.log('🔍 No user profile found (null data), returning false');
      return false;
    }
    
    const result = (data as any).has_completed_survey || false;
    console.log('🔍 Survey completion status:', result);
    return result;
  },

  async markSurveyComplete(userId: string): Promise<{ error: string | null }> {
    console.log('🔍 markSurveyComplete called for user:', userId);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ has_completed_survey: true, updated_at: new Date().toISOString() })
        .eq('id', userId);

      console.log('🔍 Update result:', { error });

      if (error) {
        console.error('❌ Error marking survey complete:', error);
        return { error: error.message };
      }

      console.log('✅ Survey marked as complete successfully');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error marking survey complete:', error);
      return { error: error.message };
    }
  },

  async saveSurveyPreferences(userId: string, preferences: Record<string, boolean | string>): Promise<{ error: string | null }> {
    // Map category keys to correct DB columns
    const dbPrefs: Record<string, boolean | string> = {
      food_and_dining: preferences.food || false,
      shopping: preferences.shopping || false,
      coffee_and_drinks: preferences.coffee || false,
      entertainment: preferences.entertainment || false,
      fitness_and_health: preferences.fitness || false,
      beauty_and_wellness: preferences.beauty || false,
      distance_preference: preferences.distance_preference || '',
    };
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...dbPrefs }, { onConflict: 'user_id' });
      if (error) {
        console.error('❌ Error saving survey preferences:', error);
        return { error: error.message };
      }
      return { error: null };
    } catch (error: any) {
      console.error('❌ Exception saving survey preferences:', error);
      return { error: error.message };
    }
  },

  async saveSurveyAnswers(userId: string, answers: {
    reward_style: string;
    reward_types: string[];
    social_sharing: string;
    category_ratings: Record<string, number>;
    discovery_source: string;
  }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_survey_answers')
        .upsert({
          user_id: userId,
          reward_style: answers.reward_style,
          reward_types: answers.reward_types,
          social_sharing: answers.social_sharing,
          category_ratings: answers.category_ratings,
          discovery_source: answers.discovery_source,
        }, { onConflict: 'user_id' });
      if (error) {
        console.error('❌ Error saving survey answers:', error);
        return { error: error.message };
      }
      return { error: null };
    } catch (error: any) {
      console.error('❌ Exception saving survey answers:', error);
      return { error: error.message };
    }
  },
}; 