import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';
import { MainStackParamList } from '../types/navigation';

// Icons - using simple text icons for now, can replace with lucide-react-native later
import HistoryScreen from '../screens/main/HistoryScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import RewardsScreen from '../screens/main/RewardsScreen';

const MainTab = createBottomTabNavigator<MainStackParamList>();

export default function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide the built-in tab bar since we're using custom BottomNavBar
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName: string;
          let displayName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              displayName = 'Home';
              break;
            case 'Rewards':
              iconName = 'gift';
              displayName = 'Rewards';
              break;
            case 'History':
              iconName = 'time';
              displayName = 'History';
              break;
            case 'Profile':
              iconName = 'person';
              displayName = 'Profile';
              break;
            default:
              iconName = 'home';
              displayName = 'Home';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#009688' : 'transparent',
              borderRadius: focused ? 16 : 0,
              paddingHorizontal: focused ? 16 : 8,
              paddingVertical: focused ? 8 : 4,
              minWidth: 60,
            }}>
              <Ionicons 
                name={iconName as any} 
                size={24} 
                color={focused ? 'white' : '#666'} 
              />
              <Text style={{
                fontSize: 11,
                color: focused ? 'white' : '#666',
                fontWeight: focused ? '600' : 'normal',
                marginTop: 2,
              }}>
                {displayName}
              </Text>
            </View>
          );
        },
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Rewards" component={RewardsScreen} />
      <MainTab.Screen name="History" component={HistoryScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}