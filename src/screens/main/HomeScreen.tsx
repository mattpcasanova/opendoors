import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  onPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, iconBg, onPress }) => (
  <TouchableOpacity
    className="bg-white rounded-2xl p-4 flex-row items-center mb-3 shadow-sm"
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <View 
      className="w-12 h-12 rounded-full items-center justify-center mr-4"
      style={{ backgroundColor: iconBg }}
    >
      <Text className="text-2xl">{icon}</Text>
    </View>
    
    <View className="flex-1">
      <Text className="text-gray-900 text-base font-semibold mb-1">{title}</Text>
      <Text className="text-gray-600 text-sm">{description}</Text>
    </View>
    
    <TouchableOpacity
      className="bg-teal-600 px-4 py-2 rounded-xl"
      activeOpacity={0.8}
    >
      <Text className="text-white text-xs font-bold">PLAY</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onPress }) => (
  <TouchableOpacity
    className={`items-center py-2 px-4 rounded-2xl ${active ? 'bg-teal-600' : ''}`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons 
      name={icon as any} 
      size={24} 
      color={active ? 'white' : '#999999'} 
    />
    <Text className={`text-xs mt-1 ${active ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Home');

  const playGame = (gameType: string) => {
    Alert.alert('Game Selected', `Opening ${gameType} game...`);
  };

  const navigateTo = (page: string) => {
    setActiveTab(page);
    Alert.alert('Navigation', `Navigating to ${page}...`);
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#009688', '#00796B']}
        className="pb-5"
      >
        {/* Status Bar Area */}
        <View className="flex-row justify-between items-center px-6 pt-3 pb-5">
          <Text className="text-white text-sm font-semibold">9:41</Text>
          <Text className="text-white text-sm font-semibold">100%</Text>
        </View>
        
        {/* Greeting Section */}
        <View className="px-6 pb-2">
          <Text className="text-white text-3xl font-bold mb-2">{getGreeting()}</Text>
          <Text className="text-teal-100 text-lg">Ready to open some doors?</Text>
        </View>
        
        {/* Profile Icon */}
        <TouchableOpacity 
          className="absolute right-6 top-16 w-10 h-10 bg-teal-100 rounded-full items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="person" size={20} color="#00796B" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-6 -mt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View className="mb-8">
          <View className="bg-white rounded-3xl px-5 py-3 flex-row items-center shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Ionicons name="search" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search offers..."
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Progress Section */}
        <View className="mb-8">
          <Text className="text-gray-900 text-base font-medium mb-3">
            2 more games for bonus door
          </Text>
          <View className="bg-gray-200 h-1 rounded-full">
            <View className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full"
              style={{ width: '66.7%', backgroundColor: '#FF9800' }}
            />
          </View>
        </View>

        {/* Today's Special */}
        <Text className="text-gray-900 text-xl font-semibold mb-4">Today's special</Text>
        <TouchableOpacity
          className="mb-8 rounded-2xl p-6 overflow-hidden"
          onPress={() => playGame('Target Gift Card')}
          activeOpacity={0.9}
          style={{
            shadowColor: '#FF9800',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            className="absolute inset-0"
          />
          
          {/* Decorative element */}
          <View 
            className="absolute -top-1/2 -right-5 w-25 h-full opacity-10 transform rotate-12"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: 100, height: '200%' }}
          />
          
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-2">Target Gift Card</Text>
              <Text className="text-white text-base mb-1">Win a $25 gift card</Text>
              <Text className="text-orange-100 text-sm mb-4">Limited time • Ends at midnight</Text>
              
              <TouchableOpacity
                className="bg-white self-start px-4 py-2 rounded-2xl"
                activeOpacity={0.8}
              >
                <Text className="text-orange-500 text-sm font-semibold">Play now</Text>
              </TouchableOpacity>
            </View>
            
            <Text className="text-4xl opacity-80">🎯</Text>
          </View>
        </TouchableOpacity>

        {/* Available Games */}
        <Text className="text-gray-900 text-xl font-semibold mb-4">Available games</Text>
        
        <GameCard
          title="Chick-fil-A"
          description="Free sandwich or milkshake"
          icon="🐔"
          iconBg="#FFF3E0"
          onPress={() => playGame('Chick-fil-A')}
        />
        
        <GameCard
          title="Silver Shores Market"
          description="Free fruit cup or veggie basket"
          icon="🌽"
          iconBg="#F1F8E9"
          onPress={() => playGame('Silver Shores Market')}
        />
        
        <GameCard
          title="Starbucks"
          description="Free drink upgrade"
          icon="☕"
          iconBg="#E8F5E8"
          onPress={() => playGame('Starbucks')}
        />
        
        <GameCard
          title="McDonald's"
          description="Free medium fries"
          icon="🍟"
          iconBg="#FFF8E1"
          onPress={() => playGame('McDonald\'s')}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-8"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className="flex-row justify-around items-center">
          <NavItem
            icon="home"
            label="Home"
            active={activeTab === 'Home'}
            onPress={() => navigateTo('Home')}
          />
          
          <NavItem
            icon="star"
            label="Rewards"
            active={activeTab === 'Rewards'}
            onPress={() => navigateTo('Rewards')}
          />
          
          <NavItem
            icon="time"
            label="History"
            active={activeTab === 'History'}
            onPress={() => navigateTo('History')}
          />
          
          <NavItem
            icon="person"
            label="Profile"
            active={activeTab === 'Profile'}
            onPress={() => navigateTo('Profile')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}