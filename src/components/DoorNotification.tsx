import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { DoorNotification, notificationService } from '../services/notificationService';

interface DoorNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function DoorNotificationComponent({ isVisible, onClose }: DoorNotificationProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DoorNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  useEffect(() => {
    if (isVisible && user?.id) {
      loadNotifications();
    } else if (!isVisible) {
      // Reset state when modal is closed to prevent stale data
      setNotifications([]);
      setCurrentNotificationIndex(0);
      setLoading(false);
    }
  }, [isVisible, user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await notificationService.getUnreadNotifications(user.id);
      if (result.data) {
        // Filter out bonus notifications - they have their own popup component
        const filteredNotifications = result.data.filter(n => 
          !(n.distributor_name === 'OpenDoors' && n.reason === 'Bonus play available! Play any game for free.')
        );
        setNotifications(filteredNotifications);
        setCurrentNotificationIndex(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      console.log('📥 Marking notification as read:', notificationId);
      const result = await notificationService.markNotificationAsRead(notificationId);

      if (result.success) {
        console.log('✅ Notification marked as read successfully');
        // Check if this is the last notification BEFORE removing it
        const isLastNotification = notifications.length <= 1;

        console.log(`📊 Notifications remaining: ${notifications.length - 1} (isLast: ${isLastNotification})`);

        // Remove the notification from the list
        setNotifications(prev => prev.filter(n => n.id !== notificationId));

        if (isLastNotification) {
          // No more notifications, close the modal immediately
          console.log('🚪 Closing notification modal (last notification)');
          onClose();
        } else {
          // If there are more notifications, show the next one
          console.log('➡️ Moving to next notification');
          setCurrentNotificationIndex(prev => Math.min(prev, notifications.length - 2));
        }
      } else {
        console.warn('⚠️ Failed to mark notification as read');
        onClose();
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // On error, still try to close the modal to prevent freezing
      onClose();
    }
  };

  // Mark all notifications as read when modal is dismissed (via back button or swipe)
  const handleClose = async () => {
    // Mark all remaining notifications as read
    if (notifications.length > 0) {
      await Promise.all(
        notifications.map(n => notificationService.markNotificationAsRead(n.id))
      );
    }
    onClose();
  };

  const currentNotification = notifications[currentNotificationIndex];

  // Don't render the modal at all if not visible or no notifications
  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={isVisible && notifications.length > 0}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {loading ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#009688" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
                Loading notifications...
              </Text>
            </View>
          ) : currentNotification ? (
            <>
              {/* Header */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#E6FFFA',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12
                }}>
                  <Ionicons name="gift" size={30} color="#009688" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'center' }}>
                  You received doors!
                </Text>
              </View>

              {/* Notification Content */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                  +{currentNotification.doors_sent} Door{currentNotification.doors_sent > 1 ? 's' : ''}
                </Text>
                <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 12 }}>
                  From: {currentNotification.distributor_name}
                </Text>
                {currentNotification.reason && (
                  <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' }}>
                    "{currentNotification.reason}"
                  </Text>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#009688',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
                onPress={() => handleMarkAsRead(currentNotification.id)}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  Got it!
                </Text>
              </TouchableOpacity>

              {/* Notification Counter */}
              {notifications.length > 1 && (
                <Text style={{ 
                  fontSize: 12, 
                  color: '#9CA3AF', 
                  textAlign: 'center', 
                  marginTop: 12 
                }}>
                  {currentNotificationIndex + 1} of {notifications.length} notifications
                </Text>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>
                No new notifications
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
