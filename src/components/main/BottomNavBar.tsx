import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
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
        overflow: 'hidden',
      }}
    >
      {/* Liquid Glass Effect */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint="light"
        style={{
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: 16,
          paddingHorizontal: 12,
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0,0,0,0.06)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Subtle overlay for extra depth */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
          }}
          pointerEvents="none"
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
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
                paddingVertical: 8,
                paddingHorizontal: 10,
              }}
              activeOpacity={0.65}
            >
              {isActive ? (
                // Liquid Glass effect for active tab
                <BlurView
                  intensity={60}
                  tint="light"
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 26,
                    minWidth: 76,
                    minHeight: 56,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: 'rgba(20, 184, 166, 0.25)',
                    shadowColor: '#14b8a6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 5,
                    transform: [{ scale: 1.05 }],
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(20, 184, 166, 0.15)',
                    }}
                    pointerEvents="none"
                  />
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        marginBottom: 7,
                        padding: 3,
                        borderRadius: 10,
                        backgroundColor: 'rgba(20, 184, 166, 0.08)',
                      }}
                    >
                      <IconComponent
                        size={26}
                        color="#14b8a6"
                        strokeWidth={2.5}
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: '#14b8a6',
                        letterSpacing: 0.3,
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      {item.label}
                    </Text>

                    {/* Enhanced active indicator */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -10,
                        width: 36,
                        height: 3.5,
                        backgroundColor: '#14b8a6',
                        borderRadius: 2,
                        shadowColor: '#14b8a6',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.4,
                        shadowRadius: 3,
                      }}
                    />
                  </View>
                </BlurView>
              ) : (
                // Regular inactive tab
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 26,
                    minWidth: 76,
                    minHeight: 56,
                  }}
                >
                  <View style={{ marginBottom: 7 }}>
                    <IconComponent
                      size={24}
                      color="#6b7280"
                      strokeWidth={2}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#6b7280',
                      letterSpacing: 0.3,
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
    </View>
  );
} 