import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, Gift, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import type { MainStackParamList } from '../../types/navigation';

// Tab config
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
    badge: 2, // Example badge count
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

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

type Props = {};

export default function BottomNavBar({}: Props) {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute();
  // Map route name to tab id
  const currentRoute = route.name;
  // Normalize route name to tab id
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
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.95)' : 'white',
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 12,
      paddingBottom: Platform.OS === 'ios' ? 6 : 4,
      paddingTop: 0,
      height: 64,
      justifyContent: 'center',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 0, height: 56 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          // Only show badge if item.badge > 0
          const showBadge = !!item.badge && item.badge > 0;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigateTo(item.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                height: 48,
                position: 'relative',
                overflow: 'visible',
              }}
              activeOpacity={0.8}
            >
              <View style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 44,
                borderRadius: 16,
                borderWidth: isActive ? 2 : 0,
                borderColor: isActive ? '#14b8a6' : 'transparent',
                backgroundColor: isActive ? '#e6fcf7' : 'transparent',
                paddingHorizontal: 0,
                paddingVertical: 0,
                marginBottom: 0,
                shadowColor: isActive ? '#14b8a6' : 'transparent',
                shadowOpacity: isActive ? 0.08 : 0,
                shadowRadius: isActive ? 6 : 0,
                elevation: isActive ? 2 : 0,
                overflow: 'visible',
              }}>
                <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <IconComponent
                    size={24}
                    color={isActive ? '#14b8a6' : '#94A3B8'}
                  />
                  {/* Badge */}
                  {showBadge && (
                    <View style={{ position: 'absolute', top: -8, right: -14, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, borderWidth: 2, borderColor: '#fff' }}>
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#14b8a6' : '#94A3B8',
                  marginTop: 2,
                  textAlign: 'center',
                }}>{item.label}</Text>
                {/* Active indicator dot (optional, can remove if not needed) */}
                {/* {isActive && <View style={{ position: 'absolute', bottom: 4, left: '50%', marginLeft: -3, width: 6, height: 6, backgroundColor: '#14b8a6', borderRadius: 3 }} />} */}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
} 