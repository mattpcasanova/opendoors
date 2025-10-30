import { supabase } from '../lib/supabase';

export interface DoorNotification {
  id: string;
  user_id: string;
  distributor_name: string;
  doors_sent: number;
  reason: string;
  created_at: string;
  read: boolean;
}

class NotificationService {
  /**
   * Create a door notification for a user
   */
  async createDoorNotification(
    userId: string,
    distributorName: string,
    doorsSent: number,
    reason: string
  ) {
    try {
      const { data, error } = await supabase.rpc('create_door_notification', {
        p_user_id: userId,
        p_distributor_name: distributorName,
        p_doors_sent: doorsSent,
        p_reason: reason,
      });

      if (error) {
        console.error('Error creating door notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating door notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('door_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return { data: null, error: error.message };
      }

      return { data: data as DoorNotification[] | null, error: null };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('door_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }
}

export const notificationService = new NotificationService();
