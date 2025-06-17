import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameCard, { SpecialGameCard } from '../../components/game/GameCard';
import BottomNavBar from '../../components/main/BottomNavBar';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { supabase } from '../../lib/supabase';
import { gamesService, Prize } from '../../services/gameLogic/games';
import { rewardsService } from '../../services/rewardsService';
import type { MainStackParamList } from '../../types/navigation';
import GameScreen from '../game/GameScreen';

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

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

interface DailyGameButtonProps {
  hasPlayedToday: boolean;
  onPress: () => void;
}

const DailyGameButton: React.FC<DailyGameButtonProps> = ({ hasPlayedToday, onPress }) => {
  if (hasPlayedToday) {
    return (
      <TouchableOpacity
        className="bg-gray-400 py-4 px-6 rounded-2xl mb-6 flex-row items-center justify-center"
        disabled={true}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name="checkmark-circle" size={20} color="white" />
        <Text className="text-white text-base font-bold ml-2">Played Today - Come Back Tomorrow!</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="bg-green-500 py-4 px-6 rounded-2xl mb-6 flex-row items-center justify-center"
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Ionicons name="gift" size={20} color="white" />
      <Text className="text-white text-base font-bold ml-2">Play Your Free Daily Game!</Text>
    </TouchableOpacity>
  );
};

interface ProgressSectionProps {
  gamesUntilBonus: number;
  onClaimBonus: () => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ gamesUntilBonus, onClaimBonus }) => {
  const totalGames = 5;
  const progressPercentage = ((totalGames - gamesUntilBonus) / totalGames) * 100;
  const isComplete = gamesUntilBonus === 0;

  if (isComplete) {
    return (
      <View className="mb-8">
        <TouchableOpacity
          className="bg-green-500 py-4 px-6 rounded-2xl flex-row items-center justify-center"
          onPress={onClaimBonus}
          activeOpacity={0.8}
          style={{
            shadowColor: '#22C55E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="trophy" size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-3">🎉 Claim Your Free Bonus Door!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-gray-900 text-base font-medium mb-3">
        {gamesUntilBonus} more games for bonus door
      </Text>
      <View className="bg-gray-200 h-2 rounded-full">
        <View 
          className="h-full rounded-full"
          style={{ 
            width: `${progressPercentage}%`, 
            backgroundColor: '#FF9800'
          }}
        />
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  const { location } = useLocation();
  const [filteredGames, setFilteredGames] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredGame, setFeaturedGame] = useState<Prize | null>(null);
  const [regularGames, setRegularGames] = useState<Prize[]>([]);
  
  // Game state tracking
  const [gamesUntilBonus, setGamesUntilBonus] = useState(5);
  const [hasPlayedAnyGameToday, setHasPlayedAnyGameToday] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Prize | null>(null);
  const [lastPlayDate, setLastPlayDate] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🏠 Starting to fetch games...');
        
        // First, let's see all active games
        const allGamesResult = await gamesService.getActiveGames();
        console.log('🏠 All active games:', allGamesResult);
        
        const [featuredResult, regularResult] = await Promise.all([
          gamesService.getFeaturedGame(),
          gamesService.getRegularGames()
        ]);

        console.log('🏠 Featured game result:', featuredResult);
        console.log('🏠 Regular games result:', regularResult);

        if (featuredResult.error) {
          console.error('❌ Error fetching featured game:', featuredResult.error);
        } else {
          console.log('✅ Featured game set:', featuredResult.data?.name);
          setFeaturedGame(featuredResult.data);
        }

        if (regularResult.error) {
          console.error('❌ Error fetching regular games:', regularResult.error);
        } else {
          console.log('✅ Regular games set:', regularResult.data?.length, 'games');
          console.log('✅ Regular games list:', regularResult.data?.map(g => g.name));
          setRegularGames(regularResult.data || []);
        }

      } catch (err) {
        console.error('❌ Error fetching games:', err);
        setError('Failed to load games. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Check if it's a new day and reset daily game
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastPlayDate !== today) {
      setHasPlayedAnyGameToday(false);
    }
  }, [lastPlayDate]);

  // Add this effect to filter games based on search text
  useEffect(() => {
    if (!regularGames) return;
    
    const filtered = regularGames.filter(game => 
      game.name.toLowerCase().includes(searchText.toLowerCase()) ||
      game.description.toLowerCase().includes(searchText.toLowerCase())
    );
    
    setFilteredGames(filtered);
  }, [searchText, regularGames]);

  const playGame = (prize: Prize) => {
    // Debug logging - make it very obvious
    console.log('=====================================');
    console.log('🎮 PLAYING GAME:', prize.name);
    console.log('🚪 PRIZE DOORS FROM DATABASE:', prize.doors);
    console.log('🏪 PRIZE LOCATION:', prize.location_name);
    console.log('📋 FULL PRIZE OBJECT:', prize);
    console.log('=====================================');
    
    // Set the current game and navigate to game screen
    setCurrentGame(prize);
    setShowGameScreen(true);
  };

  const playDailyGame = () => {
    // Navigate to game screen instead of showing alert
    setShowGameScreen(true);
  };

  const handleGameComplete = async (won: boolean, switched: boolean) => {
    // Mark that a game has been played today
    setHasPlayedAnyGameToday(true);
    setLastPlayDate(new Date().toDateString());
    
    // Count towards bonus progress
    if (gamesUntilBonus > 0) {
      setGamesUntilBonus(prev => prev - 1);
    }

    // If the user won, save the reward
    if (won && currentGame && user) {
      try {
        // Debug logging
        console.log('🔍 Auth Debug:');
        console.log('User from useAuth:', user);
        console.log('User ID being sent:', user?.id);
        
        // Get Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Supabase session user:', session?.user?.id);

        const { success, error } = await rewardsService.addUserReward(user.id, currentGame.id);
        
        if (!success) {
          console.error('Failed to save reward:', error);
          Alert.alert(
            'Error Saving Reward',
            'Your prize was won but there was an error saving it. Please contact support.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.error('Error in handleGameComplete:', err);
        Alert.alert(
          'Error',
          'There was an unexpected error. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }

    // Show result alert with game-specific message
    const gameName = currentGame?.name || 'Daily Free Prize';
    const message = won ? 
      `Congratulations! You won the ${gameName}!` : 
      'Better luck next time! You can play again tomorrow.';
    
    Alert.alert('Game Complete', message);
    
    // Go back to home screen and clear current game
    setShowGameScreen(false);
    setCurrentGame(null);
  };

  const handleBackFromGame = () => {
    setShowGameScreen(false);
  };

  // If showing game screen, render that instead
  if (showGameScreen && currentGame) {
    return (
      <GameScreen
        prizeName={currentGame.name}
        prizeDescription={currentGame.description}
        locationName={currentGame.location_name || 'Game Store'}
        doorCount={currentGame.doors || 3}
        onGameComplete={handleGameComplete}
        onBack={handleBackFromGame}
      />
    );
  }

  const claimBonusDoor = () => {
    Alert.alert(
      'Bonus Door! 🎉', 
      'Congratulations! You\'ve earned a bonus door. Opening now...',
      [
        {
          text: 'Claim Prize!',
          onPress: () => {
            // Reset the progress
            setGamesUntilBonus(5);
          }
        }
      ]
    );
  };

  const navigateTo = (page: string) => {
    setActiveTab(page);
    if (page === 'Rewards') {
      navigation.navigate('Rewards');
    } else if (page === 'History') {
      navigation.navigate('History');
    } else if (page === 'Profile') {
      navigation.navigate('Profile');
    }
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <LinearGradient colors={['#009688', '#00796B']} style={{ paddingBottom: 20 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 20,
        }}>
          <View style={{ flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
              Welcome back!
            </Text>
            <Text style={{ color: '#B2DFDB', fontSize: 16 }}>
              Ready to explore?
            </Text>
          </View>
          <View style={{
            width: 120,
            height: 120,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 16,
          }}>
            <Image source={require('../../../assets/OpenDoorsLogo.png')} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
          </View>
        </View>
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

        {/* Daily Free Game Button - Updated */}
        <DailyGameButton 
          hasPlayedToday={hasPlayedAnyGameToday}
          onPress={playDailyGame}
        />

        {/* Progress Section */}
        <ProgressSection 
          gamesUntilBonus={gamesUntilBonus}
          onClaimBonus={claimBonusDoor}
        />

        {/* Today's Special */}
        {featuredGame && (
          <>
            <Text className="text-gray-900 text-xl font-semibold mb-4">Today's special</Text>
            <SpecialGameCard
              prize={featuredGame}
              userLocation={location}
              onPress={() => playGame(featuredGame)}
            />
          </>
        )}

        {/* If no featured game from database, show fallback */}
        {!featuredGame && (
          <>
            <Text className="text-gray-900 text-xl font-semibold mb-4">Today's special</Text>
            <SpecialGameCard
              prize={{
                id: 'target-gift-card',
                name: 'Target Gift Card',
                description: 'Win a $25 gift card',
                value: 25,
                prize_type: 'gift_card',
                doors: 3,
                created_at: new Date().toISOString(),
                location_name: 'Target',
                address: 'Online',
                stock_quantity: 10
              }}
              userLocation={location}
              onPress={() => playGame({
                id: 'target-gift-card',
                name: 'Target Gift Card',
                description: 'Win a $25 gift card',
                value: 25,
                prize_type: 'gift_card',
                doors: 3,
                created_at: new Date().toISOString()
              })}
            />
          </>
        )}

        {/* Available Games */}
        <Text className="text-gray-900 text-xl font-semibold mb-4">Available games</Text>
        
        {filteredGames.map((prize) => (
          <GameCard
            key={prize.id}
            prize={prize}
            userLocation={location}
            onPress={() => playGame(prize)}
          />
        ))}

        {/* Debug Info - Updated */}
        <View className="mt-8 p-4 bg-gray-100 rounded-xl">
          <Text className="text-gray-700 text-sm font-semibold mb-2">Debug Info:</Text>
          <Text className="text-gray-600 text-xs">Games until bonus: {gamesUntilBonus}</Text>
          <Text className="text-gray-600 text-xs">Any game played today: {hasPlayedAnyGameToday ? 'Yes' : 'No'}</Text>
          <Text className="text-gray-600 text-xs">Last play date: {lastPlayDate || 'Never'}</Text>
          <Text className="text-gray-600 text-xs">Current game: {currentGame?.name || 'None'}</Text>
          <Text className="text-gray-600 text-xs">Current game doors: {currentGame?.doors || 'N/A'}</Text>
          <Text className="text-gray-600 text-xs">Show game screen: {showGameScreen ? 'Yes' : 'No'}</Text>
          {featuredGame && (
            <Text className="text-gray-600 text-xs">Featured game doors: {featuredGame.doors}</Text>
          )}
        </View>
      </ScrollView>

      <BottomNavBar initialTab="Home" />
    </SafeAreaView>
  );
}