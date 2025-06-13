import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { MainStackParamList } from '../../types/navigation';

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

type TabName = 'Home' | 'Rewards' | 'History' | 'Profile';

type Props = {
  initialTab?: TabName;
};

export default function BottomNavBar({ initialTab = 'Home' }: Props) {
  const navigation = useNavigation<MainStackNavigationProp>();
  const [activeTab, setActiveTab] = useState<TabName>(initialTab);

  const navigateTo = (page: TabName) => {
    setActiveTab(page);
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
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 24, // Extra padding for devices with home indicator
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 8,
    }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
      }}>
        <TouchableOpacity 
          onPress={() => navigateTo('Home')} 
          style={{ 
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: activeTab === 'Home' ? '#E6F4F1' : 'transparent',
          }}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={activeTab === 'Home' ? '#009688' : '#94A3B8'} 
          />
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            fontWeight: activeTab === 'Home' ? '600' : '500',
            color: activeTab === 'Home' ? '#009688' : '#94A3B8'
          }}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateTo('Rewards')} 
          style={{ 
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: activeTab === 'Rewards' ? '#E6F4F1' : 'transparent',
          }}
        >
          <Ionicons 
            name="gift" 
            size={24} 
            color={activeTab === 'Rewards' ? '#009688' : '#94A3B8'} 
          />
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            fontWeight: activeTab === 'Rewards' ? '600' : '500',
            color: activeTab === 'Rewards' ? '#009688' : '#94A3B8'
          }}>Rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateTo('History')} 
          style={{ 
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: activeTab === 'History' ? '#E6F4F1' : 'transparent',
          }}
        >
          <Ionicons 
            name="time" 
            size={24} 
            color={activeTab === 'History' ? '#009688' : '#94A3B8'} 
          />
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            fontWeight: activeTab === 'History' ? '600' : '500',
            color: activeTab === 'History' ? '#009688' : '#94A3B8'
          }}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateTo('Profile')} 
          style={{ 
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: activeTab === 'Profile' ? '#E6F4F1' : 'transparent',
          }}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color={activeTab === 'Profile' ? '#009688' : '#94A3B8'} 
          />
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            fontWeight: activeTab === 'Profile' ? '600' : '500',
            color: activeTab === 'Profile' ? '#009688' : '#94A3B8'
          }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 