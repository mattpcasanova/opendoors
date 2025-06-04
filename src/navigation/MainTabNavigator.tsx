import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';
import { MainTabParamList } from '../types/navigation';

// Icons
import { Clock, Home, Star, User } from 'lucide-react-native';

// Import your existing screens
import HistoryScreen from '../screens/main/HistoryScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import RewardsScreen from '../screens/main/RewardsScreen';

const MainTab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar icon component
const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  const iconSize = 24;
  
  const IconComponent = {
    Home: Home,
    Rewards: Star,
    History: Clock,
    Profile: User,
  }[name];

  return (
    <View className={`items-center justify-center ${focused ? 'bg-teal-600 rounded-2xl px-4 py-2' : ''}`}>
      <IconComponent 
        size={iconSize} 
        color={focused ? 'white' : color} 
        strokeWidth={focused ? 2.5 : 2}
      />
      <Text 
        className={`text-xs mt-1 ${focused ? 'text-white font-medium' : 'text-gray-500'}`}
        style={{ color: focused ? 'white' : color }}
      >
        {name}
      </Text>
    </View>
  );
};

export default function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0.5,
          borderTopColor: '#E0E0E0',
          paddingBottom: 28, // For safe area
          paddingTop: 12,
          height: 88,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon name={route.name} color={color} focused={focused} />
        ),
        tabBarActiveTintColor: '#009688',
        tabBarInactiveTintColor: '#999999',
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <MainTab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{
          tabBarLabel: 'Rewards',
        }}
      />
      <MainTab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </MainTab.Navigator>
  );
} 