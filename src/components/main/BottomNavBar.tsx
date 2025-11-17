import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { Clock, Gift, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import type { MainTabParamList } from '../../types/navigation';

// Tab config - removed badge completely
const NAV_ITEMS = [
  {
    id: 'Home',
    label: 'Home',
    icon: Home,
  },
  {
    id: 'Rewards',
    label: 'Rewards',
    icon: Gift,
  },
  {
    id: 'History',
    label: 'History',
    icon: Clock,
  },
  {
    id: 'Profile',
    label: 'Profile',
    icon: User,
  },
];

type MainStackNavigationProp = NativeStackNavigationProp<MainTabParamList>;

type Props = {};

export default function BottomNavBar({}: Props) {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute();
  
  const currentRoute = route.name;
  
  const getActiveTab = () => {
    if (currentRoute.toLowerCase().includes('reward')) return 'Rewards';
    if (currentRoute.toLowerCase().includes('history')) return 'History';
    if (currentRoute.toLowerCase().includes('profile')) return 'Profile';
    return 'Home';
  };
  
  const activeTab = getActiveTab();

  const navigateTo = (page: string) => {
    if (page === 'Home') {
      navigation.navigate('Home');
    } else if (page === 'Rewards') {
      navigation.navigate('Rewards');
    } else if (page === 'History') {
      navigation.navigate('History');
    } else if (page === 'Profile') {
      navigation.navigate('Profile');
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      {/* Separator line */}
      <View
        style={{
          height: 1,
          backgroundColor: 'rgba(0,0,0,0.06)',
        }}
      />

      {/* Liquid Glass Effect */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 95 : 100}
        tint="light"
        style={{
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          paddingTop: 8,
          paddingHorizontal: 8,
          backgroundColor: 'rgba(255,255,255,0.72)',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: 56,
            paddingHorizontal: 4,
          }}
        >
          {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigateTo(item.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.6}
            >
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  backgroundColor: isActive ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                  minHeight: 48,
                }}
              >
                <View style={{ marginBottom: 4 }}>
                  <IconComponent
                    size={24}
                    color={isActive ? '#14b8a6' : '#9ca3af'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </View>

                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#14b8a6' : '#9ca3af',
                    letterSpacing: -0.1,
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
    </View>
  );
} 