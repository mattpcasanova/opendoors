import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

interface PreferenceItem {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

interface SettingItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigate';
  enabled?: boolean;
}

type RootStackParamList = {
  Home: undefined;
  Rewards: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  
  // Game Preferences State
  const [gamePreferences, setGamePreferences] = useState<PreferenceItem[]>([
    { id: 'food', label: 'Food & Dining', icon: 'restaurant', enabled: true },
    { id: 'shopping', label: 'Shopping', icon: 'bag', enabled: true },
    { id: 'coffee', label: 'Coffee & Drinks', icon: 'cafe', enabled: false },
    { id: 'entertainment', label: 'Entertainment', icon: 'film', enabled: true },
    { id: 'fitness', label: 'Fitness & Health', icon: 'fitness', enabled: false },
    { id: 'beauty', label: 'Beauty & Wellness', icon: 'sparkles', enabled: true },
  ]);

  // Privacy & Notifications State
  const [privacySettings, setPrivacySettings] = useState<SettingItem[]>([
    { 
      id: 'location', 
      label: 'Location Services', 
      subtitle: 'Find nearby games and offers',
      icon: 'location', 
      type: 'toggle', 
      enabled: true 
    },
    { 
      id: 'notifications', 
      label: 'Push Notifications', 
      subtitle: 'New games and rewards',
      icon: 'notifications', 
      type: 'toggle', 
      enabled: true 
    },
  ]);

  // Account Settings
  const accountSettings: SettingItem[] = [
    { id: 'account', label: 'Account Details', icon: 'person', type: 'navigate' },
    { id: 'security', label: 'Security', icon: 'shield-checkmark', type: 'navigate' },
    { id: 'payment', label: 'Payment Methods', icon: 'card', type: 'navigate' },
  ];

  // Support & Legal
  const supportSettings: SettingItem[] = [
    { id: 'help', label: 'Help & Support', icon: 'help-circle', type: 'navigate' },
    { id: 'terms', label: 'Terms of Service', icon: 'document-text', type: 'navigate' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'shield', type: 'navigate' },
    { id: 'about', label: 'About Open Doors', icon: 'information-circle', type: 'navigate' },
  ];

  const toggleGamePreference = (id: string) => {
    setGamePreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const togglePrivacySetting = (id: string) => {
    setPrivacySettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSettingPress = (id: string) => {
    // Handle navigation to different settings screens
    Alert.alert('Settings', `Navigate to ${id} settings`);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  const formatUserName = (email: string) => {
    return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        {/* Header */}
        <LinearGradient colors={['#009688', '#00796B']} style={{ paddingBottom: 20 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 15,
            paddingBottom: 20,
          }}>
            <View>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 4 }}>
                Profile
              </Text>
              <Text style={{ color: '#B2DFDB', fontSize: 16 }}>
                Manage your account and preferences
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* User Info */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 60,
                height: 60,
                backgroundColor: '#009688',
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                  {user?.email ? formatUserName(user.email) : 'User'}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  {user?.email || 'user@example.com'}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#F3F4F6',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                onPress={() => handleSettingPress('edit-profile')}
              >
                <Text style={{ color: '#374151', fontSize: 12, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Game Preferences */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="heart" size={20} color="#009688" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', flex: 1 }}>
                Game Preferences
              </Text>
              <TouchableOpacity>
                <Text style={{ color: '#009688', fontSize: 14, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
            </View>

            {gamePreferences.map((preference, index) => (
              <View key={preference.id}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}>
                  <Ionicons 
                    name={preference.icon as any} 
                    size={20} 
                    color="#6B7280" 
                    style={{ marginRight: 12 }} 
                  />
                  <Text style={{ flex: 1, fontSize: 16, color: '#374151' }}>
                    {preference.label}
                  </Text>
                  <Switch
                    value={preference.enabled}
                    onValueChange={() => toggleGamePreference(preference.id)}
                    trackColor={{ false: '#E5E7EB', true: '#009688' }}
                    thumbColor={preference.enabled ? 'white' : '#F3F4F6'}
                  />
                </View>
                {index < gamePreferences.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 32 }} />
                )}
              </View>
            ))}
          </View>

          {/* Privacy & Notifications */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Privacy & Notifications
            </Text>

            {privacySettings.map((setting, index) => (
              <View key={setting.id}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}>
                  <Ionicons 
                    name={setting.icon as any} 
                    size={20} 
                    color="#6B7280" 
                    style={{ marginRight: 12 }} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: '#374151', marginBottom: 2 }}>
                      {setting.label}
                    </Text>
                    {setting.subtitle && (
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {setting.subtitle}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => togglePrivacySetting(setting.id)}
                    trackColor={{ false: '#E5E7EB', true: '#009688' }}
                    thumbColor={setting.enabled ? 'white' : '#F3F4F6'}
                  />
                </View>
                {index < privacySettings.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 32 }} />
                )}
              </View>
            ))}
          </View>

          {/* Account Settings */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Account
            </Text>

            {accountSettings.map((setting, index) => (
              <TouchableOpacity
                key={setting.id}
                onPress={() => handleSettingPress(setting.id)}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}>
                  <Ionicons 
                    name={setting.icon as any} 
                    size={20} 
                    color="#6B7280" 
                    style={{ marginRight: 12 }} 
                  />
                  <Text style={{ flex: 1, fontSize: 16, color: '#374151' }}>
                    {setting.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
                {index < accountSettings.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 32 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Support & Legal */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Support & Legal
            </Text>

            {supportSettings.map((setting, index) => (
              <TouchableOpacity
                key={setting.id}
                onPress={() => handleSettingPress(setting.id)}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}>
                  <Ionicons 
                    name={setting.icon as any} 
                    size={20} 
                    color="#6B7280" 
                    style={{ marginRight: 12 }} 
                  />
                  <Text style={{ flex: 1, fontSize: 16, color: '#374151' }}>
                    {setting.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
                {index < supportSettings.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 32 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleSignOut}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name="log-out" size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#DC2626' }}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>

          {/* App Version */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
              Open Doors v1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Bottom Navigation Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: '#E0E0E0',
        paddingVertical: 12,
        paddingBottom: 28,
        height: 88,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#666" />
          <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Rewards')}>
          <Ionicons name="gift" size={24} color="#666" />
          <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Ionicons name="person" size={24} color="#009688" />
          <Text style={{ fontSize: 11, color: '#009688', marginTop: 2 }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 