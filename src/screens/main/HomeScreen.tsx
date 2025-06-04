import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat, Coffee, Search, Target, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../../hooks/useNavigation';
import { supabase } from '../../lib/supabase';

// Types
interface Prize {
  id: string;
  name: string;
  description: string;
  value: number;
  sponsor_name: string;
  sponsor_logo: string;
  sponsor_color: string;
  prize_type: 'digital' | 'physical' | 'discount';
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
}

interface GameCardProps {
  prize: Prize;
  onPress: () => void;
}

// Game Card Component
const GameCard: React.FC<GameCardProps> = ({ prize, onPress }) => {
  const getGameIcon = (sponsorName: string) => {
    const iconProps = { size: 24, color: 'white' };
    
    switch (sponsorName.toLowerCase()) {
      case 'chick-fil-a':
        return <ChefHat {...iconProps} />;
      case 'starbucks':
        return <Coffee {...iconProps} />;
      case 'target':
        return <Target {...iconProps} />;
      case 'mcdonald\'s':
        return <Zap {...iconProps} />;
      default:
        return <ChefHat {...iconProps} />;
    }
  };

  const getIconBackgroundColor = (sponsorName: string) => {
    switch (sponsorName.toLowerCase()) {
      case 'chick-fil-a':
        return 'bg-orange-100';
      case 'starbucks':
        return 'bg-green-100';
      case 'target':
        return 'bg-red-100';
      case 'mcdonald\'s':
        return 'bg-yellow-100';
      default:
        return 'bg-orange-100';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`w-12 h-12 rounded-full ${getIconBackgroundColor(prize.sponsor_name)} items-center justify-center mr-4`}>
        {getGameIcon(prize.sponsor_name)}
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800 mb-1">
          {prize.sponsor_name}
        </Text>
        <Text className="text-sm text-gray-600">
          {prize.description}
        </Text>
      </View>
      
      <TouchableOpacity
        className="bg-teal-600 px-4 py-2 rounded-xl"
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text className="text-white text-xs font-semibold">Play</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Special Card Component
const SpecialCard: React.FC<{ prize: Prize; onPress: () => void }> = ({ prize, onPress }) => {
  return (
    <LinearGradient
      colors={['#FF9800', '#F57C00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-6 mb-8 relative overflow-hidden"
    >
      {/* Decorative element */}
      <View className="absolute -top-8 -right-4 w-16 h-32 bg-white bg-opacity-10 transform rotate-12" />
      
      <View className="absolute top-6 right-6">
        <Text className="text-3xl opacity-80">🎯</Text>
      </View>
      
      <Text className="text-white text-2xl font-bold mb-2">
        {prize.sponsor_name}
      </Text>
      <Text className="text-white text-base mb-1">
        {prize.description}
      </Text>
      <Text className="text-orange-100 text-sm mb-4">
        Limited time • Ends at midnight
      </Text>
      
      <TouchableOpacity
        className="bg-white px-4 py-2 rounded-2xl self-start"
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text className="text-orange-600 text-sm font-semibold">Play now</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// Main HomeScreen Component
export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [specialPrize, setSpecialPrize] = useState<Prize | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gamesProgress, setGamesProgress] = useState({ played: 2, needed: 3 });

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch available prizes
  const fetchPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('active_prizes_with_sponsors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        // Set special prize (first one)
        if (data.length > 0) {
          setSpecialPrize(data[0]);
        }
        
        // Set regular prizes (rest of them)
        setPrizes(data.slice(1));
      }
    } catch (error) {
      console.error('Error fetching prizes:', error);
      Alert.alert('Error', 'Failed to load games. Please try again.');
    }
  };

  // Fetch user game progress
  const fetchGameProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('daily_plays')
          .select('free_plays_used')
          .eq('user_id', user.id)
          .eq('play_date', new Date().toISOString().split('T')[0])
          .single();
        
        if (data && !error) {
          setGamesProgress({ played: data.free_plays_used, needed: 3 });
        }
      }
    } catch (error) {
      console.error('Error fetching game progress:', error);
    }
  };

  // Handle game selection
  const handleGamePress = (prize: Prize) => {
    navigation.navigate('GameScreen', {
      prizeId: prize.id,
      prizeName: prize.name,
      sponsorName: prize.sponsor_name,
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchPrizes(),
      fetchUserProfile(),
      fetchGameProgress(),
    ]);
    setIsRefreshing(false);
  };

  // Filter prizes based on search
  const filteredPrizes = prizes.filter(prize =>
    prize.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prize.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load data on mount
  useEffect(() => {
    fetchPrizes();
    fetchUserProfile();
    fetchGameProgress();
  }, []);

  const progressPercentage = (gamesProgress.played / gamesProgress.needed) * 100;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#009688" />
      
      {/* Header */}
      <LinearGradient
        colors={['#009688', '#00796B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-5 pb-10"
      >
        {/* Status Bar Mock */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-white text-sm font-semibold">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </Text>
          <Text className="text-white text-sm font-semibold">100%</Text>
        </View>
        
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-white text-3xl font-bold mb-2">
              {getGreeting()}
            </Text>
            <Text className="text-teal-100 text-lg">
              Ready to open some doors?
            </Text>
          </View>
          
          <TouchableOpacity
            className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center"
            onPress={() => navigation.navigate('Profile' as any)}
            activeOpacity={0.8}
          >
            <Text className="text-teal-700 text-lg">
              {userProfile.first_name?.charAt(0) || '👤'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Main Content */}
      <ScrollView
        className="flex-1 px-6 -mt-5"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#009688']}
            tintColor="#009688"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="mb-8">
          <View className="bg-white rounded-3xl px-5 py-3 flex-row items-center shadow-sm">
            <Search size={20} color="#999999" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Search offers..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        
        {/* Progress Section */}
        <View className="mb-8">
          <Text className="text-gray-800 text-base font-medium mb-3">
            {gamesProgress.needed - gamesProgress.played} more games for bonus door
          </Text>
          <View className="bg-gray-200 h-1 rounded-full overflow-hidden">
            <View 
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
        
        {/* Today's Special */}
        {specialPrize && (
          <View className="mb-8">
            <Text className="text-gray-800 text-xl font-semibold mb-4">
              Today's special
            </Text>
            <SpecialCard 
              prize={specialPrize} 
              onPress={() => handleGamePress(specialPrize)} 
            />
          </View>
        )}
        
        {/* Available Games */}
        <View className="mb-20">
          <Text className="text-gray-800 text-xl font-semibold mb-4">
            Available games
          </Text>
          
          {filteredPrizes.length > 0 ? (
            filteredPrizes.map((prize) => (
              <GameCard
                key={prize.id}
                prize={prize}
                onPress={() => handleGamePress(prize)}
              />
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500 text-base mb-2">
                {searchQuery ? 'No games found' : 'No games available'}
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Check back later for new games'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 