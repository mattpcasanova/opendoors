import { Feather, Ionicons } from '@expo/vector-icons';
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
import GameCard from '../../components/game/GameCard';
import BottomNavBar from '../../components/main/BottomNavBar';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { gamesService, Prize } from '../../services/gameLogic/games';
import { UserProgress, userProgressService } from '../../services/userProgressService';
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
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 480,
            alignSelf: 'center',
            backgroundColor: '#9CA3AF',
            borderRadius: 28,
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {/* Subtle background pattern */}
          <View style={{ position: 'absolute', inset: 0, opacity: 0.10 }} pointerEvents="none">
            <View style={{ position: 'absolute', top: 16, right: 32, width: 8, height: 8, backgroundColor: 'white', borderRadius: 4 }} />
            <View style={{ position: 'absolute', bottom: 24, left: 48, width: 4, height: 4, backgroundColor: 'white', borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: '50%', right: 64, width: 6, height: 6, backgroundColor: 'white', borderRadius: 3 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 }}>
            <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark-circle" size={28} color="white" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Played Today</Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Come back tomorrow for more!</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', marginBottom: 24 }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
        }}
      >
        <LinearGradient
          colors={["#2dd4bf", "#14b8a6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 480, alignSelf: 'center' }}
        >
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(45,212,191,0.12)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="gift" size={28} color="white" style={{ opacity: 0.9 }} />
              </View>
              <View>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Play Your Free Daily Game!</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Win amazing prizes every day</Text>
              </View>
            </View>
          </View>
          {/* Floating particles effect (simple static dots for now) */}
          <View style={{ position: 'absolute', top: 8, right: 32, width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4 }} />
          <View style={{ position: 'absolute', bottom: 12, left: 32, width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 3 }} />
          <View style={{ position: 'absolute', top: '50%', right: 48, width: 10, height: 10, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 5 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
  const completedGames = totalGames - gamesUntilBonus;
  const progressPercentage = (completedGames / totalGames) * 100;
  const hasBonusPlay = bonusPlaysAvailable > 0;

  // Show static indicator if bonus play is available
  if (hasBonusPlay) {
    return (
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <LinearGradient
          colors={["#2dd4bf", "#14b8a6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 480, alignSelf: 'center' }}
        >
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(45,212,191,0.12)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="star" size={28} color="white" style={{ opacity: 0.9 }} />
              </View>
              <View>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Bonus Available!</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Play any game for free</Text>
              </View>
            </View>
          </View>
          {/* Floating particles effect (simple static dots for now) */}
          <View style={{ position: 'absolute', top: 8, right: 32, width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4 }} />
          <View style={{ position: 'absolute', bottom: 12, left: 32, width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 3 }} />
          <View style={{ position: 'absolute', top: '50%', right: 48, width: 10, height: 10, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 5 }} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', marginBottom: 32 }}>
      <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: '#F3F4F6', width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '600' }}>Progress to Bonus</Text>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>
              {gamesUntilBonus} more game{gamesUntilBonus !== 1 ? 's' : ''} to unlock
            </Text>
          </View>
          <View style={{ width: 48, height: 48, backgroundColor: '#CCFBF1', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="gift" size={28} color="#14B8A6" />
          </View>
        </View>
        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
            <LinearGradient
              colors={["#14B8A6", "#10B981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${progressPercentage}%`, height: 12, borderRadius: 6, position: 'absolute', left: 0, top: 0 }}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </LinearGradient>
          </View>
        </View>
        {/* Progress Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          {Array.from({ length: totalGames }, (_, i) => (
            <View
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor:
                  i < completedGames
                    ? '#14B8A6'
                    : i === completedGames
                    ? '#5EEAD4'
                    : '#D1D5DB',
                transform: [
                  { scale: i < completedGames ? 1.15 : 1 },
                ],
                borderWidth: i === completedGames ? 2 : 0,
                borderColor: i === completedGames ? '#99F6E4' : 'transparent',
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Start</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Feather name="zap" size={14} color="#F59E42" />
            <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 2 }}>Bonus</Text>
          </View>
        </View>
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
  const { user, session } = useAuth();

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
    // Filter state logging removed for cleaner console
  }, [selectedCategories, distance, sortBy, showOnlyFavorites]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, let's see all active games
        const allGamesResult = await gamesService.getActiveGames();
        
        const [featuredResult, regularResult] = await Promise.all([
          gamesService.getFeaturedGame(),
          gamesService.getRegularGames()
        ]);

        if (featuredResult.error) {
          console.error('❌ Error fetching featured game:', featuredResult.error);
        } else {
          setFeaturedGame(featuredResult.data);
        }

        if (regularResult.error) {
          console.error('❌ Error fetching regular games:', regularResult.error);
        } else {
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

  // Load user progress from database on mount
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await userProgressService.loadUserProgress(user.id);
        
        if (error) {
          console.error('❌ Error loading user progress:', error);
          return;
        }

        if (data) {
          setGamesUntilBonus(data.gamesUntilBonus);
          setHasPlayedAnyGameToday(data.hasPlayedToday);
          setLastPlayDate(data.lastPlayDate);
          setBonusPlaysAvailable(data.bonusPlaysAvailable);
        }
      } catch (error) {
        console.error('❌ Error loading user progress:', error);
      }
    };

    loadUserProgress();
  }, [user]);

  // Save user progress when it changes
  useEffect(() => {
    const saveUserProgress = async () => {
      if (!user) return;
      
      try {
        const progress: UserProgress = {
          gamesUntilBonus,
          hasPlayedToday: hasPlayedAnyGameToday,
          lastPlayDate,
          bonusPlaysAvailable
        };
        
        const { error } = await userProgressService.saveUserProgress(user.id, progress);
        if (error) {
          console.error('❌ Error saving user progress:', error);
        }
      } catch (error) {
        console.error('❌ Error saving user progress:', error);
      }
    };

    // Only save if we have a user and the state has been initialized
    if (user && lastPlayDate !== null) {
      saveUserProgress();
    }
  }, [user, gamesUntilBonus, hasPlayedAnyGameToday, lastPlayDate, bonusPlaysAvailable]);

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
    // In production, this should prevent playing when hasPlayedAnyGameToday is true
    // For testing, we can allow it but the button should still show grey
    if (hasPlayedAnyGameToday) {
      // In production, you would return here:
      // return;
    }
    
    // Navigate to game screen instead of showing alert
    setShowGameScreen(true);
  };

  const handleGameComplete = async (won: boolean, switched: boolean) => {
    setShowGameScreen(false);

    // Immediately update the UI state to show grey button
    setHasPlayedAnyGameToday(true);

    // Use session from context
    if (!session && user) {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again to save your game progress.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Log In',
            onPress: () => {
              navigation.navigate('Login' as any);
              return;
            }
          }
        ]
      );
      return;
    }

    // Record the game only if we have a valid session
    if (user && currentGame && session) {
      try {
        const result = await gamesService.recordGame({
          user_id: user.id,
          prize_id: currentGame.id,
          chosen_door: 1, // You can track actual values if needed
          winning_door: 1, // You can track actual values if needed  
          revealed_door: 2, // You can track actual values if needed
          switched,
          won,
          game_duration_seconds: 0, // You can track actual duration if needed
        });

        if (result.error) {
          console.error('❌ Failed to record game:', result.error);
          const errorMsg = typeof result.error === 'object' && result.error !== null && 'message' in result.error
            ? (result.error as any).message
            : String(result.error);
          Alert.alert('Error', 'Failed to record game: ' + errorMsg);
        } else {
          if (won) {
            Alert.alert('🎉 Congratulations!', `You won: ${currentGame.name}!\nCheck your rewards to claim it.`);
          }
        }
      } catch (err) {
        console.error('❌ Failed to record game:', err);
        Alert.alert('Error', 'Failed to record game.');
      }
    } else if (!user || !currentGame) {
      console.error('❌ Missing user or currentGame for recording');
    }
    
    // Update user progress in database
    if (user) {
      const usedBonus = bonusPlaysAvailable > 0;
      const { error: progressError } = await userProgressService.updateProgressAfterGame(user.id, won, usedBonus);
      
      if (progressError) {
        console.error('❌ Error updating progress:', progressError);
      } else {
        // Reload progress from database to update UI (but don't override hasPlayedToday)
        const { data: updatedProgress } = await userProgressService.loadUserProgress(user.id);
        if (updatedProgress) {
          setGamesUntilBonus(updatedProgress.gamesUntilBonus);
          // Don't override hasPlayedAnyGameToday - let it stay true until next day
          // setHasPlayedAnyGameToday(updatedProgress.hasPlayedToday);
          setLastPlayDate(updatedProgress.lastPlayDate);
          setBonusPlaysAvailable(updatedProgress.bonusPlaysAvailable);
        }
      }
    }
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
            <GameCard
              variant="featured"
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
            <GameCard
              variant="featured"
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