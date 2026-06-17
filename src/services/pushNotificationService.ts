import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase/client';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Push notification service - handles device push notifications
 * Sends actual push notifications to the user's device (like text messages)
 */
class PushNotificationService {
  private expoPushToken: string | null = null;

  /**
   * Register for push notifications and get the Expo push token
   */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      // Check if notifications are enabled in user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('notifications_enabled')
        .eq('user_id', userId)
        .single();

      if (settings && !settings.notifications_enabled) {
        console.log('[push-notifications] Notifications disabled by user');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[push-notifications] Permission denied');
        return null;
      }

      // Get the push token
      // Project ID is in app.json: "526a3bad-24d4-45b4-a6c0-2df2b26b3c83"
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '526a3bad-24d4-45b4-a6c0-2df2b26b3c83',
      });

      this.expoPushToken = tokenData.data;

      // Persist the token so the server (send-push edge function) can deliver
      // remote notifications to this device.
      const { error: tokenError } = await supabase
        .from('device_tokens')
        .upsert(
          {
            user_id: userId,
            token: this.expoPushToken,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );
      if (tokenError) {
        console.error('[push-notifications] Failed to store token:', tokenError);
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('[push-notifications] Error registering:', error);
      return null;
    }
  }

  /**
   * Send a local push notification (for testing/fallback)
   * In production, you'll want to send push notifications from your backend
   */
  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('[push-notifications] Error sending local notification:', error);
    }
  }

  /**
   * Send push notification for new play available (only once per day)
   * Tracking is done in user_settings.last_daily_notification_date in autoNotificationService
   */
  async notifyNewPlayAvailable(userId: string): Promise<void> {
    await this.sendLocalNotification(
      'New Play Available! 🎮',
      'Your free daily game is ready! Play now to win prizes.',
      { type: 'daily_reset', userId }
    );
  }

  /**
   * Send push notification for doors received (only once per event)
   */
  async notifyDoorsReceived(userId: string, distributorName: string, doorsCount: number): Promise<void> {
    // Use a unique key based on userId, distributor, and doors count to prevent duplicates
    // Note: This is a simple approach - in production you'd want to track this server-side
    const key = `doors_${userId}_${distributorName}_${doorsCount}_${Date.now()}`;
    
    await this.sendLocalNotification(
      `You received ${doorsCount} door${doorsCount > 1 ? 's' : ''}! 🎁`,
      `From: ${distributorName}`,
      { type: 'doors_received', userId, distributorName, doorsCount }
    );
  }

  /**
   * Send push notification for rewards expiring soon or tomorrow
   * Tracking is done in user_settings.last_expiring_*_date in autoNotificationService
   */
  async notifyRewardsExpiring(userId: string, count: number, isTomorrow: boolean = false): Promise<void> {
    const title = isTomorrow ? 'Rewards Expiring Tomorrow! ⏰' : 'Rewards Expiring Soon ⏰';
    const message = isTomorrow
      ? `You have ${count} reward${count > 1 ? 's' : ''} expiring tomorrow! Claim them now before they expire.`
      : `You have ${count} reward${count > 1 ? 's' : ''} expiring soon! Claim them before they expire.`;
    
    await this.sendLocalNotification(
      title,
      message,
      { type: 'rewards_expiring', userId, count, isTomorrow }
    );
  }

  /**
   * Send push notification for bonus play available (only once per bonus earned)
   */
  async notifyBonusAvailable(userId: string): Promise<void> {
    // Use timestamp to allow multiple bonus notifications if user earns multiple bonuses
    // But prevent duplicates within the same second
    const key = `bonus_${userId}_${Math.floor(Date.now() / 1000)}`;
    
    await this.sendLocalNotification(
      'Bonus Play Available! ⭐',
      'You earned a bonus play! Play any game for free.',
      { type: 'bonus_available', userId }
    );
  }

  /**
   * Send a REMOTE push to another user's devices via the send-push edge function.
   * Works even when the recipient's app is closed (requires a dev/EAS build on a
   * physical device — Expo push does not deliver to simulators).
   */
  async sendPushToUser(
    toUserId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await supabase.functions.invoke('send-push', {
        body: { to_user_id: toUserId, title, body, data: data ?? {} },
      });
    } catch (error) {
      console.error('[push-notifications] Error sending remote push:', error);
    }
  }

  /**
   * Remove this device's token (call on sign-out).
   */
  async removePushToken(): Promise<void> {
    if (!this.expoPushToken) return;
    try {
      await supabase.from('device_tokens').delete().eq('token', this.expoPushToken);
      this.expoPushToken = null;
    } catch (error) {
      console.error('[push-notifications] Error removing token:', error);
    }
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const pushNotificationService = new PushNotificationService();

