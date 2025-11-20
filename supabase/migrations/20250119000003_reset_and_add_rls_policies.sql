-- Reset and add comprehensive RLS policies to all tables
-- This migration drops all existing policies and creates new secure ones

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Prizes
DROP POLICY IF EXISTS "Anyone can view active prizes" ON public.prizes;
DROP POLICY IF EXISTS "Only admins can manage prizes" ON public.prizes;

-- Sponsors
DROP POLICY IF EXISTS "Anyone can view active sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Only admins can manage sponsors" ON public.sponsors;

-- Games
DROP POLICY IF EXISTS "Users can insert their own games" ON public.games;
DROP POLICY IF EXISTS "Users can read their own games" ON public.games;
DROP POLICY IF EXISTS "Games cannot be updated or deleted" ON public.games;
DROP POLICY IF EXISTS "Games cannot be deleted" ON public.games;

-- Game Plays
DROP POLICY IF EXISTS "Users can insert their own game plays" ON public.game_plays;
DROP POLICY IF EXISTS "Users can read their own game plays" ON public.game_plays;

-- User Rewards
DROP POLICY IF EXISTS "Users can read their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Rewards cannot be deleted" ON public.user_rewards;

-- Earned Rewards
DROP POLICY IF EXISTS "Users can read their own earned rewards" ON public.earned_rewards;
DROP POLICY IF EXISTS "Users can insert their own earned rewards" ON public.earned_rewards;
DROP POLICY IF EXISTS "Users can update their own earned rewards" ON public.earned_rewards;
DROP POLICY IF EXISTS "Earned rewards cannot be deleted" ON public.earned_rewards;

-- Referrals
DROP POLICY IF EXISTS "Users can read their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referral records when signing up" ON public.referrals;
DROP POLICY IF EXISTS "Users can update referrals they're part of" ON public.referrals;
DROP POLICY IF EXISTS "Referrals cannot be deleted" ON public.referrals;

-- User Preferences
DROP POLICY IF EXISTS "Users can read their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Preferences cannot be deleted" ON public.user_preferences;

-- User Settings
DROP POLICY IF EXISTS "Users can read their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Settings cannot be deleted" ON public.user_settings;

-- User Favorites
DROP POLICY IF EXISTS "Users can read their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- User Survey Answers
DROP POLICY IF EXISTS "Users can read their own survey answers" ON public.user_survey_answers;
DROP POLICY IF EXISTS "Users can insert their own survey answers" ON public.user_survey_answers;
DROP POLICY IF EXISTS "Users can update their own survey answers" ON public.user_survey_answers;
DROP POLICY IF EXISTS "Survey answers cannot be deleted" ON public.user_survey_answers;

-- Organizations
DROP POLICY IF EXISTS "Distributors can read their organization" ON public.organizations;
DROP POLICY IF EXISTS "Only admins can manage organizations" ON public.organizations;

-- Distributor Members
DROP POLICY IF EXISTS "Distributors can read their members" ON public.distributor_members;
DROP POLICY IF EXISTS "Members can read their own membership" ON public.distributor_members;
DROP POLICY IF EXISTS "Distributors can add members" ON public.distributor_members;
DROP POLICY IF EXISTS "Distributors can remove members" ON public.distributor_members;

-- Door Distributions
DROP POLICY IF EXISTS "Distributors can read their distributions" ON public.door_distributions;
DROP POLICY IF EXISTS "Recipients can read their distributions" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributors can create distributions" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributions cannot be updated" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributions cannot be deleted" ON public.door_distributions;

-- Door Notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.door_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.door_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.door_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.door_notifications;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_survey_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.door_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.door_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRIZES TABLE
-- ============================================

-- Anyone can read active prizes
CREATE POLICY "Anyone can view active prizes"
  ON public.prizes FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete prizes (for now, no one - add admin role later)
CREATE POLICY "Only admins can manage prizes"
  ON public.prizes FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================
-- SPONSORS TABLE
-- ============================================

-- Anyone can read active sponsors
CREATE POLICY "Anyone can view active sponsors"
  ON public.sponsors FOR SELECT
  USING (is_active = true);

-- Only admins can manage sponsors
CREATE POLICY "Only admins can manage sponsors"
  ON public.sponsors FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================
-- GAMES TABLE
-- ============================================

-- Users can only insert their own games
CREATE POLICY "Users can insert their own games"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only read their own games
CREATE POLICY "Users can read their own games"
  ON public.games FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No updates or deletes allowed (games are immutable)
CREATE POLICY "Games cannot be updated or deleted"
  ON public.games FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Games cannot be deleted"
  ON public.games FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- GAME_PLAYS TABLE (duplicate of games - will be dropped later)
-- ============================================

-- Same policies as games table
CREATE POLICY "Users can insert their own game plays"
  ON public.game_plays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own game plays"
  ON public.game_plays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- USER_REWARDS TABLE
-- ============================================

-- Users can only read their own rewards
CREATE POLICY "Users can read their own rewards"
  ON public.user_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own rewards (when they win)
CREATE POLICY "Users can insert their own rewards"
  ON public.user_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rewards (e.g., mark as claimed)
CREATE POLICY "Users can update their own rewards"
  ON public.user_rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No deletes
CREATE POLICY "Rewards cannot be deleted"
  ON public.user_rewards FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- EARNED_REWARDS TABLE (bonus doors from ads/referrals)
-- ============================================

-- Users can only read their own earned rewards
CREATE POLICY "Users can read their own earned rewards"
  ON public.earned_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own earned rewards
CREATE POLICY "Users can insert their own earned rewards"
  ON public.earned_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own earned rewards (claim them)
CREATE POLICY "Users can update their own earned rewards"
  ON public.earned_rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No deletes
CREATE POLICY "Earned rewards cannot be deleted"
  ON public.earned_rewards FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- REFERRALS TABLE
-- ============================================

-- Users can read referrals where they are the referrer or referred
CREATE POLICY "Users can read their own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Users can insert referrals where they are the referred user
CREATE POLICY "Users can create referral records when signing up"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referred_id);

-- System can update referral status (first game played, rewards granted)
CREATE POLICY "Users can update referrals they're part of"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id)
  WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- No deletes
CREATE POLICY "Referrals cannot be deleted"
  ON public.referrals FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- USER_PREFERENCES TABLE
-- ============================================

-- Users can only read their own preferences
CREATE POLICY "Users can read their own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No deletes
CREATE POLICY "Preferences cannot be deleted"
  ON public.user_preferences FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- USER_SETTINGS TABLE
-- ============================================

-- Users can only read their own settings
CREATE POLICY "Users can read their own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No deletes
CREATE POLICY "Settings cannot be deleted"
  ON public.user_settings FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- USER_FAVORITES TABLE
-- ============================================

-- Users can only read their own favorites
CREATE POLICY "Users can read their own favorites"
  ON public.user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- No updates needed for favorites

-- ============================================
-- USER_SURVEY_ANSWERS TABLE
-- ============================================

-- Users can only read their own survey answers
CREATE POLICY "Users can read their own survey answers"
  ON public.user_survey_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own survey answers
CREATE POLICY "Users can insert their own survey answers"
  ON public.user_survey_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own survey answers
CREATE POLICY "Users can update their own survey answers"
  ON public.user_survey_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No deletes
CREATE POLICY "Survey answers cannot be deleted"
  ON public.user_survey_answers FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================

-- Distributors can read organizations they're part of
-- Regular users don't need to see organizations
CREATE POLICY "Distributors can read their organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.organization_id = organizations.id
      AND user_profiles.user_type IN ('distributor', 'admin')
    )
  );

-- Only admins can manage organizations (for now, restricted)
CREATE POLICY "Only admins can manage organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================
-- DISTRIBUTOR_MEMBERS TABLE
-- ============================================

-- Distributors can read their own members
CREATE POLICY "Distributors can read their members"
  ON public.distributor_members FOR SELECT
  TO authenticated
  USING (auth.uid() = distributor_id);

-- Members can see they're part of a distributor's list
CREATE POLICY "Members can read their own membership"
  ON public.distributor_members FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

-- Distributors can add members
CREATE POLICY "Distributors can add members"
  ON public.distributor_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = distributor_id
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('distributor', 'admin')
    )
  );

-- Distributors can remove members
CREATE POLICY "Distributors can remove members"
  ON public.distributor_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = distributor_id
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('distributor', 'admin')
    )
  );

-- ============================================
-- DOOR_DISTRIBUTIONS TABLE
-- ============================================

-- Distributors can read distributions they sent
CREATE POLICY "Distributors can read their distributions"
  ON public.door_distributions FOR SELECT
  TO authenticated
  USING (auth.uid() = distributor_id);

-- Recipients can read distributions they received
CREATE POLICY "Recipients can read their distributions"
  ON public.door_distributions FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Distributors can create distributions
CREATE POLICY "Distributors can create distributions"
  ON public.door_distributions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = distributor_id
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('distributor', 'admin')
    )
  );

-- No updates or deletes (distributions are immutable)
CREATE POLICY "Distributions cannot be updated"
  ON public.door_distributions FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Distributions cannot be deleted"
  ON public.door_distributions FOR DELETE
  TO authenticated
  USING (false);

-- ============================================
-- DOOR_NOTIFICATIONS TABLE
-- ============================================

-- Users can only read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON public.door_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications for users
CREATE POLICY "System can create notifications"
  ON public.door_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Any authenticated user can trigger notification creation

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.door_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.door_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.prizes TO authenticated, anon;
GRANT SELECT ON public.sponsors TO authenticated, anon;
GRANT ALL ON public.games TO authenticated;
GRANT ALL ON public.game_plays TO authenticated;
GRANT ALL ON public.user_rewards TO authenticated;
GRANT ALL ON public.earned_rewards TO authenticated;
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_survey_answers TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT ALL ON public.distributor_members TO authenticated;
GRANT ALL ON public.door_distributions TO authenticated;
GRANT ALL ON public.door_notifications TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Anyone can view active prizes" ON public.prizes IS
  'All users (authenticated and anonymous) can view active prizes';

COMMENT ON POLICY "Users can read their own games" ON public.games IS
  'Users can only see their own game history for privacy';

COMMENT ON POLICY "Distributors can read their members" ON public.distributor_members IS
  'Teachers/distributors can see their student list';

COMMENT ON POLICY "Recipients can read their distributions" ON public.door_distributions IS
  'Students can see doors they received from their teacher';
