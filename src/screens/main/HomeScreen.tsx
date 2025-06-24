import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView as RNScrollView,
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
import { gamesService, Prize } from '../../services/gameLogic/games';
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
  bonusPlaysAvailable: number;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ 
  gamesUntilBonus, 
  bonusPlaysAvailable 
}) => {
  const totalGames = 5;
  const progressPercentage = gamesUntilBonus === 5 ? 0 : ((totalGames - gamesUntilBonus) / totalGames) * 100;
  const hasBonusPlay = bonusPlaysAvailable > 0;

  // Show static indicator if bonus play is available
  if (hasBonusPlay) {
    return (
      <View className="mb-8">
        <View
          className="py-4 px-6 rounded-2xl flex-row items-center justify-center bg-green-500"
          style={{
            shadowColor: '#22C55E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="star" size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-3">
            Bonus Available! Play any game to use it
          </Text>
        </View>
      </View>
    );
  }

  // Always show progress bar if not complete
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

// Helper to calculate distance (copied from GameCard)
function getDistanceValue(userLocation: { latitude: number; longitude: number } | null | undefined, address: string | undefined): number {
  if (!userLocation || !address) return 99999;
  const lowerAddress = address.toLowerCase();
  if (lowerAddress.includes('online') || lowerAddress.includes('target')) return 99999;
  if (lowerAddress.includes('biscayne') || lowerAddress.includes('downtown')) return 1.2;
  if (lowerAddress.includes('lincoln') || lowerAddress.includes('beach')) return 2.1;
  if (lowerAddress.includes('brickell')) return 0.8;
  if (lowerAddress.includes('ocean')) return 3.2;
  if (lowerAddress.includes('coral gables')) return 4.5;
  if (lowerAddress.includes('wynwood')) return 2.7;
  return 1.5;
}

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
  const [bonusPlaysAvailable, setBonusPlaysAvailable] = useState(0);
  const { user } = useAuth();

  // Filter/sort state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [distance, setDistance] = useState('Any');
  const [sortBy, setSortBy] = useState('Closest');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const categories = ['Food', 'Drinks', 'Activities', 'Wellness', 'Retail', 'Entertainment', 'Other'];
  const distanceOptions = ['5 mi', '10 mi', '25 mi', '50 mi', 'Any'];
  const sortOptions = ['Closest', 'Suggested', 'Highest Value', 'Most Popular'];

  const currentGameIsBonus = useRef(false);

  // Debug log filter/sort state
  useEffect(() => {
    console.log('Filter state:', { selectedCategories, distance, sortBy, showOnlyFavorites });
  }, [selectedCategories, distance, sortBy, showOnlyFavorites]);

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
    
    const filtered = regularGames.filter(game => {
      const searchLower = searchText.toLowerCase();
      const nameMatch = game.name.toLowerCase().includes(searchLower);
      const descriptionMatch = game.description.toLowerCase().includes(searchLower);
      const locationMatch = (game.location_name || '').toLowerCase().includes(searchLower);
      
      return nameMatch || descriptionMatch || locationMatch;
    });
    
    setFilteredGames(filtered);
  }, [searchText, regularGames]);

  const playGame = (prize: Prize) => {
    setCurrentGame(prize);
    setShowGameScreen(true);
  };

  const playDailyGame = () => {
    // Navigate to game screen instead of showing alert
    setShowGameScreen(true);
  };

  const handleGameComplete = async (won: boolean, switched: boolean) => {
    setShowGameScreen(false);
    setHasPlayedAnyGameToday(true);
    setLastPlayDate(new Date().toDateString());

    console.log('🎮 Game completed');
    console.log('🎯 Bonus plays available before:', bonusPlaysAvailable);
    
    // If player has bonus available, consume it and reset progress
    if (bonusPlaysAvailable > 0) {
      console.log('✨ Consuming bonus play');
      setBonusPlaysAvailable(prev => Math.max(0, prev - 1));
      setGamesUntilBonus(5); // Reset progress bar to 0%
      Alert.alert('🎉 Bonus Used!', 'Your bonus play has been used! Progress reset.');
    } else {
      // Normal game progression
      const newGamesUntilBonus = Math.max(0, gamesUntilBonus - 1);
      setGamesUntilBonus(newGamesUntilBonus);
      
      if (newGamesUntilBonus === 0) {
        setBonusPlaysAvailable(prev => prev + 1);
        Alert.alert('🎉 Bonus Earned!', 'You\'ve earned a bonus! Your next game will reset your progress.');
      }
    }
    
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
            backgroundColor: '#E0F7F4',
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 16,
            borderWidth: 3,
            borderColor: '#009688',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Image source={require('../../../assets/OpenDoorsLogo.png')} style={{ width: 100, height: 100, resizeMode: 'contain' }} />
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View className="mb-8 mt-4">
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
              placeholder="Search games by name or description"
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Info */}
        {searchText.length > 0 && (
          <View className="mb-4">
            <Text className="text-gray-600 text-sm">
              Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} matching "{searchText}"
            </Text>
          </View>
        )}

        {/* Daily Free Game Button - Updated */}
        <DailyGameButton 
          hasPlayedToday={hasPlayedAnyGameToday}
          onPress={playDailyGame}
        />

        {/* Progress Section */}
        <ProgressSection 
          gamesUntilBonus={gamesUntilBonus}
          bonusPlaysAvailable={bonusPlaysAvailable}
        />

        {/* Today's Special - Only show when not searching */}
        {!searchText && featuredGame && (
          <>
            <Text className="text-gray-900 text-xl font-semibold mb-4">Today's special</Text>
            <SpecialGameCard
              prize={featuredGame}
              userLocation={location}
              onPress={() => playGame(featuredGame)}
            />
          </>
        )}

        {/* If no featured game from database, show fallback - Only when not searching */}
        {!searchText && !featuredGame && (
          <>
            <Text className="text-gray-900 text-xl font-semibold mb-4">Today's special</Text>
            <SpecialGameCard
              prize={{
                id: 'target-gift-card',
                name: 'Target Gift Card',
                description: 'Win a $25 gift card',
                value: 25,
                prize_type: 'gift_card',
                doors: 5,
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
                doors: 5,
                created_at: new Date().toISOString()
              })}
            />
          </>
        )}

        {/* Available Games header and Filter button row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 }}>
          <Text className="text-gray-900 text-xl font-semibold" style={{ marginBottom: 0, textAlign: 'left', flex: 1, paddingLeft: 0, marginLeft: 0 }}>
            {searchText ? 'Search Results' : 'Available games'}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#E0F7F4',
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 12,
              shadowColor: '#009688',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
              alignSelf: 'flex-end',
            }}
            onPress={() => setShowFilters(f => !f)}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={18} color="#009688" style={{ marginRight: 6 }} />
            <Text style={{ color: '#009688', fontWeight: '600', fontSize: 15 }}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Filter/Sort Bar */}
        {showFilters && (
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 18, padding: 12, marginBottom: 18, marginHorizontal: 12, paddingHorizontal: 12 }}>
            {/* Row 1: Category chips + Favorites toggle */}
            <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={{
                    backgroundColor: selectedCategories.includes(cat) ? '#009688' : '#E0F7F4',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: selectedCategories.includes(cat) ? 2 : 0,
                    borderColor: '#009688',
                  }}
                  onPress={() => setSelectedCategories(selectedCategories.includes(cat)
                    ? selectedCategories.filter(c => c !== cat)
                    : [...selectedCategories, cat])}
                >
                  <Text style={{ color: selectedCategories.includes(cat) ? 'white' : '#009688', fontWeight: '600' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
              {/* Favorites toggle chip */}
              <TouchableOpacity
                style={{
                  backgroundColor: showOnlyFavorites ? '#009688' : '#E0F7F4',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  marginRight: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: showOnlyFavorites ? 2 : 0,
                  borderColor: '#009688',
                }}
                onPress={() => setShowOnlyFavorites(f => !f)}
              >
                <Ionicons name={showOnlyFavorites ? 'star' : 'star-outline'} size={18} color={showOnlyFavorites ? '#FFD700' : '#B0B0B0'} style={{ marginRight: 4 }} />
                <Text style={{ color: showOnlyFavorites ? 'white' : '#009688', fontWeight: '600' }}>Favorites</Text>
              </TouchableOpacity>
            </RNScrollView>

            {/* Row 2: Distance segmented control */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, paddingHorizontal: 12 }}>
              {distanceOptions.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={{
                    backgroundColor: distance === opt ? '#009688' : '#E0F7F4',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: distance === opt ? 2 : 0,
                    borderColor: '#009688',
                  }}
                  onPress={() => setDistance(opt)}
                >
                  <Text style={{ color: distance === opt ? 'white' : '#009688', fontWeight: '600' }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 3: Sorting segmented control (horizontal scroll) */}
            <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                {sortOptions.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={{
                      backgroundColor: sortBy === opt ? '#009688' : '#E0F7F4',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 16,
                      marginRight: 8,
                      borderWidth: sortBy === opt ? 2 : 0,
                      borderColor: '#009688',
                    }}
                    onPress={() => setSortBy(opt)}
                  >
                    <Text style={{ color: sortBy === opt ? 'white' : '#009688', fontWeight: '600' }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RNScrollView>
          </View>
        )}
        
        {(() => {
          // Sort filteredGames by distance
          const sortedGames = [...filteredGames].sort((a, b) => {
            const distA = getDistanceValue(location, a.address);
            const distB = getDistanceValue(location, b.address);
            return distA - distB;
          });
          return (
            sortedGames.length === 0 && searchText.length > 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="search" size={48} color="#999999" />
                <Text className="text-gray-500 text-lg mt-4">No games found</Text>
                <Text className="text-gray-400 text-sm mt-2">Try searching for something else</Text>
              </View>
            ) : (
              sortedGames.map((prize) => (
                <GameCard
                  key={prize.id}
                  prize={prize}
                  userLocation={location}
                  onPress={() => playGame(prize)}
                />
              ))
            )
          );
        })()}

        {/* Debug Info - Only show when not searching */}
        {!searchText && (
          <View className="mt-8 p-4 bg-gray-100 rounded-xl">
            <Text className="text-gray-700 text-sm font-semibold mb-2">Debug Info:</Text>
            <Text className="text-gray-600 text-xs">Games until bonus: {gamesUntilBonus}</Text>
            <Text className="text-gray-600 text-xs">Bonus plays available: {bonusPlaysAvailable}</Text>
            <Text className="text-gray-600 text-xs">Any game played today: {hasPlayedAnyGameToday ? 'Yes' : 'No'}</Text>
            <Text className="text-gray-600 text-xs">Last play date: {lastPlayDate || 'Never'}</Text>
            <Text className="text-gray-600 text-xs">Current game: {currentGame?.name || 'None'}</Text>
            <Text className="text-gray-600 text-xs">Current game doors: {currentGame?.doors || 'N/A'}</Text>
            <Text className="text-gray-600 text-xs">Show game screen: {showGameScreen ? 'Yes' : 'No'}</Text>
            {featuredGame && (
              <Text className="text-gray-600 text-xs">Featured game doors: {featuredGame.doors}</Text>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNavBar initialTab="Home" />
    </SafeAreaView>
  );
}