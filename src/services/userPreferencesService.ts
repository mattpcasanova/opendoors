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
      console.error('❌ Error querying user_profiles:', error);
      return false;
    }
    
    if (!data) {
      console.log('🔍 No user profile found, returning false');
      return false;
    }
    
    const result = data.has_completed_survey || false;
    console.log('🔍 Survey completion status:', result);
    return result;
  },

  async markSurveyComplete(userId: string): Promise<{ error: string | null }> {
    console.log('🔍 markSurveyComplete called for user:', userId);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ has_completed_survey: true })
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
}; 