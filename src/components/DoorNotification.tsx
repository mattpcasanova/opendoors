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
    }
  }, [isVisible, user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await notificationService.getUnreadNotifications(user.id);
      if (result.data) {
        setNotifications(result.data);
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
      const result = await notificationService.markNotificationAsRead(notificationId);
      if (result.success) {
        // Remove the notification from the list
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // If there are more notifications, show the next one
        if (notifications.length > 1) {
          setCurrentNotificationIndex(prev => Math.min(prev, notifications.length - 2));
        } else {
          // No more notifications, close the modal
          onClose();
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const currentNotification = notifications[currentNotificationIndex];

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
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
        }}>
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
        </View>
      </View>
    </Modal>
  );
}
