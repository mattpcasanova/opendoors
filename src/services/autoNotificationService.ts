import { supabase } from './supabase/client';
import { notificationService } from './notificationService';
import { userProgressService } from './userProgressService';
import { earnedRewardsService } from './earnedRewardsService';
import { pushNotificationService } from './pushNotificationService';

/**
 * Automatic notification service - sends notifications for:
 * - Daily game reset (new play available)
 * - Rewards expiring soon (within 24-48 hours)
 * - Bonus play available (when user earns bonus)
 * - Door received from distributor (already handled in organizationService)
 * - Referral rewards (already handled in referralService)
 */
class AutoNotificationService {
  /**
   * Check if user should get "new play available" notification
   * Called when app opens or comes to foreground
   */
  async checkDailyResetNotification(userId: string): Promise<void> {
    try {
      // Check if user has played today
      const { data: progress } = await userProgressService.loadUserProgress(userId);
      if (!progress) return;

      // If user HAS played today, no need to notify
      if (progress.hasPlayedToday) {
        return;
      }

      // User hasn't played today - check if we should notify
      const todayEST = new Date().toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      // Check user_settings for last_daily_notification_date
      const { data: settings } = await supabase
        .from('user_settings')
        .select('last_daily_notification_date, notifications_enabled')
        .eq('user_id', userId)
        .single();

      // Only notify if notifications are enabled
      if (settings && !settings.notifications_enabled) {
        return;
      }

      // Check if we already notified today
      if (settings?.last_daily_notification_date === todayEST) {
        return; // Already notified today
      }

      // Check if there's already an unread notification for today from OpenDoors
      const { data: existingNotifications } = await notificationService.getUnreadNotifications(userId);
      const hasTodayNotification = existingNotifications?.some(n => 
        n.distributor_name === 'OpenDoors' && 
        n.reason === 'Your free daily game is ready! Play now to win prizes.'
      );

      if (hasTodayNotification) {
        // Already have an unread notification for today, don't create another
        // But update the date so we don't check again
        await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            last_daily_notification_date: todayEST,
          }, { onConflict: 'user_id' });
        return;
      }

      // Mark that we're about to notify today (before sending to prevent race conditions)
      await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          last_daily_notification_date: todayEST,
        }, { onConflict: 'user_id' });

      // Only send push notification (no popup for daily game - button is sufficient)
      await pushNotificationService.notifyNewPlayAvailable(userId);
    } catch (error) {
      console.warn('[auto-notifications] Error checking daily reset:', error);
    }
  }

  /**
   * Check for rewards expiring soon
   * - Shows notification 2 days before expiration: "expiring soon"
   * - Shows notification 1 day before expiration: "expiring tomorrow"
   */
  async checkExpiringRewardsNotification(userId: string): Promise<void> {
    try {
      const { data: rewards } = await earnedRewardsService.getUserEarnedRewards(userId);
      if (!rewards) return;

      const now = new Date();
      const tomorrowStart = new Date(now);
      tomorrowStart.setHours(0, 0, 0, 0);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const twoDaysStart = new Date(now);
      twoDaysStart.setHours(0, 0, 0, 0);
      twoDaysStart.setDate(twoDaysStart.getDate() + 2);
      
      const twoDaysEnd = new Date(twoDaysStart);
      twoDaysEnd.setHours(23, 59, 59, 999);

      // Check for rewards expiring tomorrow (1 day away)
      const expiringTomorrow = rewards.filter(reward => {
        if (reward.claimed) return false;
        const expiresAt = new Date(reward.expires_at);
        return expiresAt >= tomorrowStart && expiresAt <= tomorrowEnd;
      });

      // Check for rewards expiring in 2 days
      const expiringInTwoDays = rewards.filter(reward => {
        if (reward.claimed) return false;
        const expiresAt = new Date(reward.expires_at);
        return expiresAt >= twoDaysStart && expiresAt <= twoDaysEnd;
      });

      // Check user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('last_expiring_tomorrow_date, last_expiring_soon_date, notifications_enabled')
        .eq('user_id', userId)
        .single();

      if (settings && !settings.notifications_enabled) {
        return;
      }

      const todayEST = new Date().toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      // Handle "expiring tomorrow" notification (priority - show this if both apply)
      if (expiringTomorrow.length > 0) {
        // Only notify once per day
        if (settings?.last_expiring_tomorrow_date !== todayEST) {
          const count = expiringTomorrow.length;
          
          // Mark that we're about to notify today
          await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
              last_expiring_tomorrow_date: todayEST,
            }, { onConflict: 'user_id' });
          
          // Send in-app notification
          await notificationService.createDoorNotification(
            userId,
            'OpenDoors',
            1,
            `You have ${count} reward${count > 1 ? 's' : ''} expiring tomorrow! Claim them now before they expire.`
          );

          // Send push notification
          await pushNotificationService.notifyRewardsExpiring(userId, count, true); // true = tomorrow
        }
      }
      // Handle "expiring soon" notification (2 days away) - only if we didn't notify about tomorrow
      else if (expiringInTwoDays.length > 0) {
        // Only notify once per day
        if (settings?.last_expiring_soon_date !== todayEST) {
          const count = expiringInTwoDays.length;
          
          // Mark that we're about to notify today
          await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
              last_expiring_soon_date: todayEST,
            }, { onConflict: 'user_id' });
          
          // Send in-app notification
          await notificationService.createDoorNotification(
            userId,
            'OpenDoors',
            1,
            `You have ${count} reward${count > 1 ? 's' : ''} expiring soon! Claim them before they expire.`
          );

          // Send push notification
          await pushNotificationService.notifyRewardsExpiring(userId, count, false); // false = soon
        }
      }
    } catch (error) {
      console.warn('[auto-notifications] Error checking expiring rewards:', error);
    }
  }

  /**
   * Check and notify when bonus play becomes available
   * NOTE: This should only be called when a bonus is FIRST earned, not on every check
   */
  async checkBonusAvailableNotification(userId: string): Promise<void> {
    try {
      const { data: progress } = await userProgressService.loadUserProgress(userId);
      if (!progress) return;

      // If bonus is available
      if (progress.bonusPlaysAvailable > 0) {
        // Check if we already notified for this bonus
        const { data: settings } = await supabase
          .from('user_settings')
          .select('last_bonus_notification_date, notifications_enabled')
          .eq('user_id', userId)
          .single();

        if (settings && !settings.notifications_enabled) {
          return;
        }

        const todayEST = new Date().toLocaleDateString('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        // Check if we already notified today
        if (settings?.last_bonus_notification_date === todayEST) {
          return; // Already notified today
        }

        // Check if there's already an unread bonus notification
        const { data: existingNotifications } = await notificationService.getUnreadNotifications(userId);
        const hasBonusNotification = existingNotifications?.some(n => 
          n.distributor_name === 'OpenDoors' && 
          n.reason === 'Bonus play available! Play any game for free.'
        );

        if (hasBonusNotification) {
          // Already have an unread notification, don't create another
          await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
              last_bonus_notification_date: todayEST,
            }, { onConflict: 'user_id' });
          return;
        }

        // Mark that we're about to notify (before creating notification)
        await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            last_bonus_notification_date: todayEST,
          }, { onConflict: 'user_id' });

        // Send in-app notification (only once) - this triggers the popup in HomeScreen
        await notificationService.createDoorNotification(
          userId,
          'OpenDoors',
          1, // Must be > 0 per constraint, but this is just an info notification
          `Bonus play available! Play any game for free.`
        );

        // Send push notification (only once) - tracking handled above
        await pushNotificationService.notifyBonusAvailable(userId);
      }
    } catch (error) {
      console.warn('[auto-notifications] Error checking bonus notification:', error);
    }
  }

  /**
   * Run all automatic notification checks
   * Call this when app opens or comes to foreground
   */
  async checkAllNotifications(userId: string): Promise<void> {
    try {
      // Check user settings first - if notifications disabled, skip all
      const { data: settings } = await supabase
        .from('user_settings')
        .select('notifications_enabled')
        .eq('user_id', userId)
        .single();

      if (settings && !settings.notifications_enabled) {
        return; // User has disabled notifications
      }

      // Run all checks in parallel (excluding bonus - that only shows when first earned)
      await Promise.all([
        this.checkDailyResetNotification(userId),
        this.checkExpiringRewardsNotification(userId),
        // Bonus notification removed - only shows when first earned in handleGameComplete
      ]);
    } catch (error) {
      console.warn('[auto-notifications] Error in checkAllNotifications:', error);
    }
  }
}

export const autoNotificationService = new AutoNotificationService();

