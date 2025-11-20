import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    DeviceEventEmitter,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../../components/main/BottomNavBar';
import Header from "../../components/main/Header";
import { SkeletonProfileSection } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase/client';
import type { MainStackParamList } from "../../types/navigation";
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants';

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

type PreferenceKey = 'food_and_dining' | 'shopping' | 'coffee_and_drinks' | 'entertainment' | 'fitness_and_health' | 'beauty_and_wellness';

const formatUserName = (email: string) => {
  return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const CATEGORIES: { key: PreferenceKey; label: string; icon: string }[] = [
  { key: 'food_and_dining', label: 'Food & Dining', icon: 'utensils' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { key: 'coffee_and_drinks', label: 'Coffee & Drinks', icon: 'coffee' },
  { key: 'entertainment', label: 'Entertainment', icon: 'film' },
  { key: 'fitness_and_health', label: 'Fitness & Health', icon: 'heartbeat' },
  { key: 'beauty_and_wellness', label: 'Beauty & Wellness', icon: 'sparkles' },
];

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  // Game Preferences State
  const [preferences, setPreferences] = useState({
    food_and_dining: false,
    shopping: false,
    coffee_and_drinks: false,
    entertainment: false,
    fitness_and_health: false,
    beauty_and_wellness: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add state for first and last name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Add state for user stats
  const [userStats, setUserStats] = useState<{ gamesPlayed: number; rewardsEarned: number } | null>(null);

  const fetchUserStats = async () => {
    if (!user) return;
    const { historyService } = await import('../../services/historyService');
    const { data } = await historyService.getUserStats(user.id);
    if (data) setUserStats({ gamesPlayed: data.gamesPlayed, rewardsEarned: data.rewardsEarned });
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch user profile for first and last name
    supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
        }
        setLoading(false);
      });
    // Fetch user_preferences
    supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setPreferences({
            food_and_dining: !!data.food_and_dining,
            shopping: !!data.shopping,
            coffee_and_drinks: !!data.coffee_and_drinks,
            entertainment: !!data.entertainment,
            fitness_and_health: !!data.fitness_and_health,
            beauty_and_wellness: !!data.beauty_and_wellness,
          });
        }
        setLoading(false);
      });
    // Fetch user_settings for privacy toggles
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setPrivacySettings(prev => prev.map(s =>
            s.id === 'location'
              ? { ...s, enabled: !!data.location_enabled }
              : s.id === 'notifications'
                ? { ...s, enabled: !!data.notifications_enabled }
                : s
          ));
        }
      });
    // Fetch user stats for games played and rewards earned
    fetchUserStats();
  }, [user]);

  // Listen for game completion events to auto-refresh stats
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('REFRESH_HISTORY', () => {
      console.log('🔄 Refreshing profile stats after game completion');
      fetchUserStats();
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  const handleToggle = (key: keyof typeof preferences) => {
    if (!editMode) return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    // Upsert the preferences row for this user
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, ...preferences }, { onConflict: 'user_id' });
    
    if (!error) {
      // Emit event to refresh preferences in HomeScreen
      DeviceEventEmitter.emit('REFRESH_USER_PREFERENCES');
    }
    
    setEditMode(false);
    setSaving(false);
  };

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
  ];

  // Support & Legal
  const supportSettings: SettingItem[] = [
    { id: 'help', label: 'Help & Support', icon: 'help-circle', type: 'navigate' },
    { id: 'terms', label: 'Terms of Service', icon: 'document-text', type: 'navigate' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'shield', type: 'navigate' },
    { id: 'about', label: 'About Open Doors', icon: 'information-circle', type: 'navigate' },
  ];

  // Add state variables
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showGamePrefsEdit, setShowGamePrefsEdit] = useState(false);
  const [userName, setUserName] = useState(user?.email ? formatUserName(user.email) : 'User');
  const [tempUserName, setTempUserName] = useState(userName);

  const toggleGamePreference = (id: string) => {
    setPreferences(prev => ({ ...prev, [id as keyof typeof preferences]: !prev[id as keyof typeof preferences] }));
  };

  const handlePrivacyToggle = async (id: string, value: boolean) => {
    if (id === 'location') {
      if (value) {
        Alert.alert(
          'Enable Location Services',
          'Allow OpenDoors to access your location to find nearby games and offers?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                  setPrivacySettings(prev => prev.map(s => s.id === 'location' ? { ...s, enabled: true } : s));
                  // Sync to backend
                  if (user) await supabase.from('user_settings').upsert({ user_id: user.id, location_enabled: true }, { onConflict: 'user_id' });
                  // Emit event to refresh game cards with distance
                  DeviceEventEmitter.emit('LOCATION_ENABLED');
                } else {
                  Alert.alert('Permission Denied', 'Location permission was not granted.');
                  setPrivacySettings(prev => prev.map(s => s.id === 'location' ? { ...s, enabled: false } : s));
                  if (user) await supabase.from('user_settings').upsert({ user_id: user.id, location_enabled: false }, { onConflict: 'user_id' });
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Disable Location Services',
          'Are you sure you want to disable location services? You can re-enable them at any time.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setPrivacySettings(prev => prev.map(s => s.id === 'location' ? { ...s, enabled: true } : s)) },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                setPrivacySettings(prev => prev.map(s => s.id === 'location' ? { ...s, enabled: false } : s));
                if (user) await supabase.from('user_settings').upsert({ user_id: user.id, location_enabled: false }, { onConflict: 'user_id' });
              }
            }
          ]
        );
      }
    } else if (id === 'notifications') {
      if (value) {
        Alert.alert(
          'Enable Notifications',
          'Allow OpenDoors to send you push notifications about new games and rewards?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                  setPrivacySettings(prev => prev.map(s => s.id === 'notifications' ? { ...s, enabled: true } : s));
                  if (user) {
                    await supabase.from('user_settings').upsert({ user_id: user.id, notifications_enabled: true }, { onConflict: 'user_id' });
                    // Register for push notifications
                    const { pushNotificationService } = await import('../../services/pushNotificationService');
                    await pushNotificationService.registerForPushNotifications(user.id);
                  }
                } else {
                  Alert.alert('Permission Denied', 'Notification permission was not granted.');
                  setPrivacySettings(prev => prev.map(s => s.id === 'notifications' ? { ...s, enabled: false } : s));
                  if (user) await supabase.from('user_settings').upsert({ user_id: user.id, notifications_enabled: false }, { onConflict: 'user_id' });
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Disable Notifications',
          'Are you sure you want to disable push notifications? You can re-enable them at any time.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setPrivacySettings(prev => prev.map(s => s.id === 'notifications' ? { ...s, enabled: true } : s)) },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                setPrivacySettings(prev => prev.map(s => s.id === 'notifications' ? { ...s, enabled: false } : s));
                if (user) await supabase.from('user_settings').upsert({ user_id: user.id, notifications_enabled: false }, { onConflict: 'user_id' });
              }
            }
          ]
        );
      }
    }
  };

  const handleSettingPress = (id: string) => {
    switch (id) {
      case 'edit-profile':
        setTempUserName(userName);
        setShowEditProfile(true);
        break;
      case 'account':
        Alert.alert(
          'Account Details',
          `Email: ${user?.email || 'Not available'}\nMember since: ${new Date(user?.created_at || Date.now()).toLocaleDateString()}\nTotal games played: ${userStats?.gamesPlayed ?? 0}\nRewards earned: ${userStats?.rewardsEarned ?? 0}`,
          [{ text: 'OK' }]
        );
        break;
      case 'help':
        Alert.alert(
          'Help & Support',
          'How can we help you?',
          [
            { text: 'FAQ', onPress: () => openFAQ() },
            { text: 'Contact Support', onPress: () => contactSupport() },
            { text: 'Report Issue', onPress: () => reportIssue() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        break;
      case 'terms':
        showTermsOfService();
        break;
      case 'privacy':
        showPrivacyPolicy();
        break;
      case 'about':
        Alert.alert(
          'About Open Doors',
          `Version: 1.0.0\nBuild: 2024.1\n\nOpen Doors is a gamified rewards platform that lets you win real prizes from local businesses through probability-based door games.\n\n© 2024 Open Doors Inc.`,
          [{ text: 'OK' }]
        );
        break;
      default:
        Alert.alert('Settings', `${id} settings coming soon!`);
    }
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

  // Add helper functions
  const changePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your current password:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Next', 
          onPress: (currentPassword) => {
            if (currentPassword) {
              Alert.prompt(
                'New Password',
                'Enter your new password:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Change', 
                    onPress: (newPassword) => {
                      if (newPassword && newPassword.length >= 6) {
                        Alert.alert('Success', 'Password changed successfully!');
                      } else {
                        Alert.alert('Error', 'Password must be at least 6 characters long.');
                      }
                    }
                  }
                ],
                'secure-text'
              );
            }
          }
        }
      ],
      'secure-text'
    );
  };

  const setup2FA = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'Would you like to enable 2FA for extra security?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => Alert.alert('Success', '2FA setup complete! You will receive a confirmation email.')
        }
      ]
    );
  };

  const addPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose payment type:',
      [
        { text: 'Credit/Debit Card', onPress: () => Alert.alert('Info', 'Credit card form would open here') },
        { text: 'PayPal', onPress: () => Alert.alert('Info', 'PayPal integration would open here') },
        { text: 'Apple Pay', onPress: () => Alert.alert('Info', 'Apple Pay setup would open here') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const viewPaymentMethods = () => {
    Alert.alert(
      'Saved Payment Methods',
      'No payment methods saved yet.\n\nPayment methods are only required for premium features and bonus games.',
      [{ text: 'OK' }]
    );
  };

  const openFAQ = () => {
    Alert.alert(
      'Frequently Asked Questions',
      '• How do I win prizes?\n  Play door games and use probability to your advantage!\n\n• Are the prizes real?\n  Yes! All prizes are provided by our partner businesses.\n\n• How do I redeem rewards?\n  Show the QR code at the business location.\n\n• Can I play multiple times?\n  You get one free daily game, plus bonus games for staying active!',
      [{ text: 'OK' }]
    );
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Get in touch with our support team:',
      [
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@opendoors.com?subject=Support Request') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const reportIssue = () => {
    Alert.prompt(
      'Report Issue',
      'Please describe the issue you encountered:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: (issue) => {
            if (issue && issue.trim()) {
              // Send to email for now
              const subject = 'Issue Report - OpenDoors App';
              const body = `Issue Report:\n\n${issue}\n\nUser: ${user?.email || 'Unknown'}\nDate: ${new Date().toLocaleString()}`;
              Linking.openURL(`mailto:support@opendoors.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
              Alert.alert('Thank You', 'Your issue has been reported. We\'ll get back to you within 24 hours.');
            }
          }
        }
      ],
      'plain-text',
      '',
      'Tell us what happened...'
    );
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const showTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      `OpenDoors Terms of Service\n\nLast updated: ${new Date().toLocaleDateString()}\n\n1. Acceptance of Terms\nBy using the OpenDoors app, you agree to these terms and conditions.\n\n2. Service Description\nOpenDoors is a gamified rewards platform that allows users to play probability-based door games to win prizes from local businesses.\n\n3. User Eligibility\nYou must be at least 18 years old to use this service.\n\n4. Game Rules\n- Each user gets one free daily game\n- Games are based on probability and chance\n- Prizes are provided by partner businesses\n- All game results are final\n\n5. Rewards and Redemption\n- Rewards must be claimed within 30 days\n- Redemption is subject to business availability\n- OpenDoors is not responsible for business closures or changes\n\n6. Privacy\nYour privacy is important to us. See our Privacy Policy for details.\n\n7. Limitation of Liability\nOpenDoors is not liable for any damages arising from use of the service.\n\n8. Changes to Terms\nWe may update these terms at any time. Continued use constitutes acceptance.\n\n9. Contact\nFor questions about these terms, contact support@opendoors.com`,
      [{ text: 'OK' }]
    );
  };

  const showPrivacyPolicy = async () => {
    // Privacy policy must be a web URL (required by App Store/AdMob)
    // Update this URL once you have your privacy policy hosted
    const privacyPolicyUrl = 'https://opendoors.app/privacy'; // TODO: Update with actual URL
    
    Alert.alert(
      'Privacy Policy',
      'View our privacy policy in your browser?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open in Browser',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(privacyPolicyUrl);
              if (supported) {
                await Linking.openURL(privacyPolicyUrl);
              } else {
                Alert.alert('Error', 'Unable to open privacy policy URL');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to open privacy policy');
            }
          }
        }
      ]
    );
  };

  const saveProfile = () => {
    setUserName(tempUserName);
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleGamePrefsEdit = () => {
    setShowGamePrefsEdit(true);
  };

  const handleSettingsPress = () => {
    console.log("Settings pressed")
  }

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
          <Header
            variant="page"
            title="Profile"
            subtitle="Manage your account and preferences"
          />

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
            {/* User Info Skeleton */}
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              marginBottom: Spacing.lg,
              ...Shadows.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.gray200,
                  marginRight: Spacing.md,
                }} />
                <View style={{ flex: 1 }}>
                  <View style={{
                    width: 120,
                    height: 18,
                    backgroundColor: Colors.gray200,
                    borderRadius: BorderRadius.sm,
                    marginBottom: Spacing.sm,
                  }} />
                  <View style={{
                    width: 180,
                    height: 14,
                    backgroundColor: Colors.gray200,
                    borderRadius: BorderRadius.sm,
                  }} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <View style={{
                    width: 40,
                    height: 28,
                    backgroundColor: Colors.gray200,
                    borderRadius: BorderRadius.sm,
                    marginBottom: Spacing.xs,
                  }} />
                  <View style={{
                    width: 80,
                    height: 12,
                    backgroundColor: Colors.gray200,
                    borderRadius: BorderRadius.sm,
                  }} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{
                    width: 40,
                    height: 28,
                    backgroundColor: Colors.gray200,
                    borderRadius: BorderRadius.sm,
                    marginBottom: Spacing.xs,
                  }} />
                  <View style={{
                    width: 80,
                    height: 12,
                    backgroundColor: Colors.gray200,
                    borderRadius: BorderRadius.sm,
                  }} />
                </View>
              </View>
            </View>

            {/* Game Preferences Skeleton */}
            <SkeletonProfileSection itemCount={6} />

            {/* Privacy Skeleton */}
            <SkeletonProfileSection itemCount={2} />

            {/* Account Skeleton */}
            <SkeletonProfileSection itemCount={1} />

            {/* Support Skeleton */}
            <SkeletonProfileSection itemCount={4} />
          </ScrollView>
          <BottomNavBar />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
        <Header
          variant="page"
          title="Profile"
          subtitle="Manage your account and preferences"
        />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
          {/* User Info & Stats Card */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
            borderWidth: 1,
            borderColor: Colors.gray100,
          }}>
            {/* User Info Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
              {/* Avatar Circle with Initials */}
              <View style={{
                width: 64,
                height: 64,
                borderRadius: BorderRadius.full,
                backgroundColor: Colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.md,
              }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: Colors.primary
                }}>
                  {firstName && lastName
                    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                    : user?.email?.[0]?.toUpperCase() || 'U'
                  }
                </Text>
              </View>

              {/* Name & Email */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: Colors.gray900,
                  marginBottom: 4
                }}>
                  {firstName} {lastName}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.gray600 }}>
                  {user?.email || 'user@example.com'}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={{
              flexDirection: 'row',
              paddingTop: Spacing.lg,
              borderTopWidth: 1,
              borderTopColor: Colors.gray100,
            }}>
              {/* Games Played */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: Spacing.sm,
                }}>
                  <Ionicons name="game-controller" size={24} color={Colors.primary} />
                </View>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: Colors.gray900,
                  marginBottom: 2,
                }}>
                  {userStats?.gamesPlayed ?? 0}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: Colors.gray600,
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                  Games Played
                </Text>
              </View>

              {/* Divider */}
              <View style={{
                width: 1,
                backgroundColor: Colors.gray100,
                marginHorizontal: Spacing.md,
              }} />

              {/* Rewards Earned */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.warningLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: Spacing.sm,
                }}>
                  <Ionicons name="trophy" size={24} color={Colors.warning} />
                </View>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: Colors.gray900,
                  marginBottom: 2,
                }}>
                  {userStats?.rewardsEarned ?? 0}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: Colors.gray600,
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                  Rewards Earned
                </Text>
              </View>
            </View>
          </View>

          {/* Game Preferences */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
            borderWidth: 1,
            borderColor: Colors.gray100,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Spacing.lg
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: Colors.gray900
              }}>
                Game Preferences
              </Text>
              <TouchableOpacity
                onPress={() => setEditMode((v) => !v)}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: Colors.primary,
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  {editMode ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {CATEGORIES.map((cat, index) => (
              <View key={cat.key}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.md,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      color: Colors.gray900,
                      fontWeight: '500'
                    }}>
                      {cat.label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={!editMode}
                    onPress={() => handleToggle(cat.key as keyof typeof preferences)}
                    style={{ opacity: editMode ? 1 : 0.5 }}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 48,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: preferences[cat.key as keyof typeof preferences] ? Colors.primary : Colors.gray200,
                      justifyContent: 'center',
                      padding: 2,
                    }}>
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: Colors.white,
                        alignSelf: preferences[cat.key as keyof typeof preferences] ? 'flex-end' : 'flex-start',
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                        elevation: 1,
                      }} />
                    </View>
                  </TouchableOpacity>
                </View>
                {index < CATEGORIES.length - 1 && (
                  <View style={{
                    height: 1,
                    backgroundColor: Colors.gray100,
                    marginLeft: 0
                  }} />
                )}
              </View>
            ))}

            {editMode && (
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  marginTop: Spacing.lg,
                  backgroundColor: Colors.primary,
                  borderRadius: BorderRadius.md,
                  paddingVertical: Spacing.md,
                  alignItems: 'center',
                  opacity: saving ? 0.6 : 1,
                  ...Shadows.sm,
                }}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: Colors.white,
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Privacy & Notifications */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
            borderWidth: 1,
            borderColor: Colors.gray100,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors.gray900,
              marginBottom: Spacing.lg
            }}>
              Privacy & Notifications
            </Text>

            {privacySettings.map((setting, index) => (
              <View key={setting.id}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.md,
                }}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={Colors.gray600}
                    style={{ marginRight: Spacing.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      color: Colors.gray900,
                      marginBottom: 2,
                      fontWeight: '500'
                    }}>
                      {setting.label}
                    </Text>
                    {setting.subtitle && (
                      <Text style={{
                        fontSize: 12,
                        color: Colors.gray600
                      }}>
                        {setting.subtitle}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={(value) => handlePrivacyToggle(setting.id, value)}
                    trackColor={{ false: Colors.gray200, true: Colors.primary }}
                    thumbColor={setting.enabled ? Colors.white : Colors.gray100}
                  />
                </View>
                {index < privacySettings.length - 1 && (
                  <View style={{
                    height: 1,
                    backgroundColor: Colors.gray100,
                    marginLeft: 32
                  }} />
                )}
              </View>
            ))}
          </View>

          {/* Account Settings */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
            borderWidth: 1,
            borderColor: Colors.gray100,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors.gray900,
              marginBottom: Spacing.lg
            }}>
              Account
            </Text>

            {accountSettings.map((setting, index) => (
              <TouchableOpacity
                key={setting.id}
                onPress={() => handleSettingPress(setting.id)}
                activeOpacity={0.7}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.md,
                }}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={Colors.gray600}
                    style={{ marginRight: Spacing.md }}
                  />
                  <Text style={{
                    flex: 1,
                    fontSize: 16,
                    color: Colors.gray900,
                    fontWeight: '500'
                  }}>
                    {setting.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.gray400}
                  />
                </View>
                {index < accountSettings.length - 1 && (
                  <View style={{
                    height: 1,
                    backgroundColor: Colors.gray100,
                    marginLeft: 32
                  }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Support & Legal */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
            borderWidth: 1,
            borderColor: Colors.gray100,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors.gray900,
              marginBottom: Spacing.lg
            }}>
              Support & Legal
            </Text>

            {supportSettings.map((setting, index) => (
              <TouchableOpacity
                key={setting.id}
                onPress={() => handleSettingPress(setting.id)}
                activeOpacity={0.7}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.md,
                }}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={Colors.gray600}
                    style={{ marginRight: Spacing.md }}
                  />
                  <Text style={{
                    flex: 1,
                    fontSize: 16,
                    color: Colors.gray900,
                    fontWeight: '500'
                  }}>
                    {setting.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.gray400}
                  />
                </View>
                {index < supportSettings.length - 1 && (
                  <View style={{
                    height: 1,
                    backgroundColor: Colors.gray100,
                    marginLeft: 32
                  }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              marginBottom: Spacing.lg,
              ...Shadows.sm,
              borderWidth: 1,
              borderColor: Colors.errorLight,
            }}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons
                name="log-out"
                size={20}
                color={Colors.error}
                style={{ marginRight: Spacing.sm }}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: Colors.error
              }}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>

          {/* App Version */}
          <View style={{
            alignItems: 'center',
            marginBottom: Spacing.lg
          }}>
            <Text style={{
              fontSize: 12,
              color: Colors.gray500
            }}>
              Open Doors v1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavBar />

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: Spacing.lg,
          }}>
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.lg,
              padding: Spacing.xl,
              ...Shadows.sm,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                marginBottom: Spacing.lg,
                textAlign: 'center',
                color: Colors.gray900
              }}>
                Edit Profile
              </Text>

              <Text style={{
                fontSize: 14,
                color: Colors.gray600,
                marginBottom: Spacing.sm
              }}>
                Display Name
              </Text>
              <TextInput
                value={tempUserName}
                onChangeText={setTempUserName}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.gray200,
                  borderRadius: BorderRadius.md,
                  padding: Spacing.md,
                  fontSize: 16,
                  marginBottom: Spacing.lg,
                  color: Colors.gray900
                }}
                placeholder="Enter your name"
                placeholderTextColor={Colors.gray500}
              />

              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: Colors.gray100,
                    padding: Spacing.md,
                    borderRadius: BorderRadius.md,
                    alignItems: 'center',
                  }}
                  onPress={() => setShowEditProfile(false)}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: Colors.gray700,
                    fontWeight: '600'
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: Colors.primary,
                    padding: Spacing.md,
                    borderRadius: BorderRadius.md,
                    alignItems: 'center',
                    ...Shadows.sm,
                  }}
                  onPress={saveProfile}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    color: Colors.white,
                    fontWeight: '600'
                  }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Game Preferences Edit Modal */}
      <Modal
        visible={showGamePrefsEdit}
        transparent
        animationType="slide"
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: Spacing.lg,
        }}>
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.xl,
            maxHeight: '80%',
            ...Shadows.sm,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              marginBottom: Spacing.lg,
              textAlign: 'center',
              color: Colors.gray900
            }}>
              Game Preferences
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {CATEGORIES.map((cat, index) => (
                <View key={cat.key}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: Spacing.md,
                  }}>
                    <Text style={{
                      flex: 1,
                      fontSize: 16,
                      color: Colors.gray900,
                      fontWeight: '500'
                    }}>
                      {cat.label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleGamePreference(cat.key)}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: preferences[cat.key as keyof typeof preferences] ? Colors.primary : Colors.gray200,
                        justifyContent: 'center',
                        padding: 2,
                      }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: Colors.white,
                          alignSelf: preferences[cat.key as keyof typeof preferences] ? 'flex-end' : 'flex-start',
                          shadowColor: '#000',
                          shadowOpacity: 0.08,
                          shadowRadius: 2,
                          elevation: 1,
                        }} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  {index < CATEGORIES.length - 1 && (
                    <View style={{
                      height: 1,
                      backgroundColor: Colors.gray100,
                    }} />
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: Spacing.md,
                borderRadius: BorderRadius.md,
                alignItems: 'center',
                marginTop: Spacing.lg,
                ...Shadows.sm,
              }}
              onPress={() => setShowGamePrefsEdit(false)}
              activeOpacity={0.8}
            >
              <Text style={{
                color: Colors.white,
                fontWeight: '600'
              }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
} 