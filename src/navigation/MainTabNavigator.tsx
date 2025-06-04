import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';
import { MainTabParamList } from '../types/navigation';

// Icons - using simple text icons for now, can replace with lucide-react-native later
import HomeScreen from '../screens/main/HomeScreen';
// These screens don't exist yet, so we'll create placeholders
const RewardsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>🎁 Rewards</Text>
    <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Coming soon!</Text>
  </View>
);

const HistoryScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>📊 History</Text>
    <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Coming soon!</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>👤 Profile</Text>
    <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Coming soon!</Text>
  </View>
);

const MainTab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const iconMap = {
    Home: '🏠',
    Rewards: '🎁',
    History: '📊',
    Profile: '👤',
  };

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
      <Text style={{ fontSize: 20, marginBottom: 2 }}>
        {iconMap[name as keyof typeof iconMap]}
      </Text>
      <Text style={{
        fontSize: 11,
        color: focused ? 'white' : '#666',
        fontWeight: focused ? '600' : 'normal',
      }}>
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
          paddingBottom: 28, // Safe area
          paddingTop: 12,
          height: 88,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Rewards" component={RewardsScreen} />
      <MainTab.Screen name="History" component={HistoryScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}