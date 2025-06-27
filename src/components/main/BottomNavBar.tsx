import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, Gift, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import type { MainStackParamList } from '../../types/navigation';

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

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

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
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.97)' : 'white',
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingTop: 16,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
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
                paddingVertical: 6,
                paddingHorizontal: 8,
              }}
              activeOpacity={0.65}
            >
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 24,
                  backgroundColor: isActive 
                    ? 'rgba(20, 184, 166, 0.12)' 
                    : 'transparent',
                  minWidth: 68,
                  minHeight: 48,
                  shadowColor: isActive ? '#14b8a6' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.08 : 0,
                  shadowRadius: isActive ? 8 : 0,
                  elevation: isActive ? 3 : 0,
                  transform: [{ scale: isActive ? 1.05 : 1 }],
                  borderWidth: isActive ? 1 : 0,
                  borderColor: isActive ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                }}
              >
                <View
                  style={{
                    marginBottom: 6,
                    padding: isActive ? 2 : 0,
                    borderRadius: 8,
                    backgroundColor: isActive ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                  }}
                >
                  <IconComponent
                    size={isActive ? 24 : 22}
                    color={isActive ? '#14b8a6' : '#6b7280'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: isActive ? 12 : 11,
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#14b8a6' : '#6b7280',
                    letterSpacing: 0.3,
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {item.label}
                </Text>
                
                {/* Enhanced active indicator */}
                {isActive && (
                  <>
                    {/* Primary indicator line */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -8,
                        width: 32,
                        height: 3,
                        backgroundColor: '#14b8a6',
                        borderRadius: 2,
                        shadowColor: '#14b8a6',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                      }}
                    />
                    {/* Subtle glow effect */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -8,
                        width: 24,
                        height: 2,
                        backgroundColor: '#14b8a6',
                        borderRadius: 1,
                        opacity: 0.4,
                      }}
                    />
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
} 