import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    DeviceEventEmitter,
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
import Header from "../../components/main/Header";
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { EarnedReward, earnedRewardsService } from '../../services/earnedRewardsService';
import { gamesService, Prize } from '../../services/gameLogic/games';
import { UserProgress, userProgressService } from '../../services/userProgressService';
import type { MainTabParamList } from '../../types/navigation';
import GameScreen from '../game/GameScreen';

type MainStackNavigationProp = NativeStackNavigationProp<MainTabParamList>;

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

interface EarnedRewardsSectionProps {
  earnedDoors?: number;
}

const EarnedRewardsSection: React.FC<EarnedRewardsSectionProps> = ({ 
  earnedDoors = 0 
}) => {
  const navigation = useNavigation<MainStackNavigationProp>();

  const handlePress = () => {
    navigation.navigate('EarnedRewards' as any);
  };

  return (
    <TouchableOpacity 
      style={{ 
        marginBottom: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: '#1F2937',
            marginBottom: 4 
          }}>
            Earned Rewards
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: '#6B7280' 
          }}>
            Extra doors available
          </Text>
        </View>
        
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#009688',
          backgroundColor: 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#009688',
          }}>
            {earnedDoors}
          </Text>
        </View>
      </View>
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
                <Ionicons name="gift" size={28} color="white" style={{ opacity: 0.9 }} />
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
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            borderWidth: 2,
            borderColor: '#009688',
            backgroundColor: 'transparent',
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Gift size={28} color="#009688" />
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
            <Zap size={14} color="#F59E42" />
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
  const [earnedDoors, setEarnedDoors] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([]);
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

  // Load earned rewards and update count
  const loadEarnedRewards = async () => {
    if (!user?.id) return;
    
    try {
      const { data: rewards, error: rewardsError } = await earnedRewardsService.getUserEarnedRewards(user.id);
      if (rewardsError) {
        console.error('Error loading earned rewards:', rewardsError);
        return;
      }
      setEarnedRewards(rewards || []);

      const { count, error: countError } = await earnedRewardsService.getUnclaimedDoorsCount(user.id);
      if (countError) {
        console.error('Error loading earned doors count:', countError);
        return;
      }
      setEarnedDoors(count);
    } catch (error) {
      console.error('Error in loadEarnedRewards:', error);
    }
  };

  // Debug log filter/sort state
  useEffect(() => {
    // Filter state logging removed for cleaner console
  }, [selectedCategories, distance, sortBy, showOnlyFavorites]);

  // Load earned rewards when user changes
  useEffect(() => {
    if (user?.id) {
      loadEarnedRewards();
    }
  }, [user?.id]);

  // Listen for earned doors refresh events
  useEffect(() => {
    const refreshListener = DeviceEventEmitter.addListener('REFRESH_EARNED_DOORS', () => {
      loadEarnedRewards();
    });

    return () => {
      refreshListener.remove();
    };
  }, []);

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
    
    // Use featured game if available, otherwise use fallback game
    console.log('🎮 Featured game data:', {
      featuredGame: JSON.stringify(featuredGame, null, 2),
      usingFeaturedGame: !!featuredGame
    });

    let dailyGame = featuredGame;
    
    // If we have a featured game that's a Target game, ensure it has 5 doors
    if (dailyGame && (
      dailyGame.name.toLowerCase().includes('target') ||
      dailyGame.description.toLowerCase().includes('target') ||
      dailyGame.location_name?.toLowerCase().includes('target')
    )) {
      dailyGame = {
        ...dailyGame,
        doors: 5
      };
    }
    
    // If no featured game, use the fallback Target game
    if (!dailyGame) {
      dailyGame = {
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
      };
    }
    
    console.log('🎮 Using daily game:', JSON.stringify(dailyGame, null, 2));
    
    setCurrentGame(dailyGame);
    setShowGameScreen(true);
  };

  const handleGameComplete = async (won: boolean, switched: boolean) => {
    if (!user || !currentGame) return;
    
    try {
      // Determine which type of door was used based on priority system
      let doorType = 'daily';
      let usedEarnedRewardId: string | null = null;

      // Priority 1: Daily Play (if available)
      if (!hasPlayedAnyGameToday) {
        doorType = 'daily';
      }
      // Priority 2: Bonus Door (if daily not available but bonus is)
      else if (bonusPlaysAvailable > 0) {
        doorType = 'bonus';
      }
      // Priority 3: Earned Door (if neither daily nor bonus available)
      else if (earnedDoors > 0) {
        doorType = 'earned';
        // Get the next unclaimed reward
        const { data: nextReward, error: rewardError } = await earnedRewardsService.getNextUnclaimedReward(user.id);
        if (rewardError || !nextReward) {
          console.error('❌ Error getting next earned reward:', rewardError);
          Alert.alert('Error', 'No earned doors available. Please earn more doors first.');
          return;
        }
        usedEarnedRewardId = nextReward.id;
      } else {
        Alert.alert('No Doors Available', 'You have no doors available to play. Please wait for your daily reset or earn more doors.');
        return;
      }

      // Record the game result
      const { error: gameError } = await gamesService.recordGame({
        user_id: user.id,
        prize_id: currentGame.id,
        won,
        switched,
        chosen_door: 1, // TODO: Track actual chosen door
        winning_door: won ? 1 : 2, // TODO: Track actual winning door
        revealed_door: 3, // TODO: Track actual revealed door
        game_duration_seconds: 30 // TODO: Track actual duration
      });

      if (gameError) {
        console.error('❌ Error recording game:', gameError);
        Alert.alert('Error', 'Failed to save game result. Please try again.');
        return;
      }

      // Show result alert
      Alert.alert(
        won ? 'Congratulations!' : 'Better luck next time!',
        won
          ? `You won ${currentGame.name}!`
          : 'Keep playing to win great prizes!',
        [{ 
          text: 'OK',
          onPress: () => setShowGameScreen(false)
        }]
      );
      
      // Update user progress in database based on door type used
      if (user) {
        const usedBonus = doorType === 'bonus';
        const { error: progressError } = await userProgressService.updateProgressAfterGame(user.id, won, usedBonus);
        
        if (progressError) {
          console.error('❌ Error updating progress:', progressError);
        } else {
          // Reload progress from database to update UI
          const { data: updatedProgress } = await userProgressService.loadUserProgress(user.id);
          if (updatedProgress) {
            setGamesUntilBonus(updatedProgress.gamesUntilBonus);
            setLastPlayDate(updatedProgress.lastPlayDate);
            setBonusPlaysAvailable(updatedProgress.bonusPlaysAvailable);
          }
        }

        // If used earned door, claim it
        if (doorType === 'earned' && usedEarnedRewardId) {
          const { success, error: claimError } = await earnedRewardsService.claimEarnedReward(usedEarnedRewardId);
          if (!success || claimError) {
            console.error('❌ Error claiming earned reward:', claimError);
            Alert.alert('Error', 'Failed to use earned door. Please try again.');
            return;
          }
        }
      }

      // Reload earned rewards to update count
      await loadEarnedRewards();

      // Emit events to refresh History and Rewards screens
      DeviceEventEmitter.emit('REFRESH_HISTORY');
      DeviceEventEmitter.emit('REFRESH_REWARDS');

      // Set hasPlayedToday to true
      setHasPlayedAnyGameToday(true);

    } catch (error) {
      console.error('❌ Error in handleGameComplete:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleBackFromGame = () => {
    setShowGameScreen(false);
  };

  // If showing game screen, render that instead
  if (showGameScreen && currentGame) {
    console.log('🎮 Starting game with:', {
      name: currentGame.name,
      description: currentGame.description,
      locationName: currentGame.location_name,
      doorCount:
        currentGame.name.toLowerCase().includes('target') || 
        currentGame.description.toLowerCase().includes('target') ||
        currentGame.location_name?.toLowerCase().includes('target')
          ? 5
          : typeof currentGame.doors === 'number' ? currentGame.doors : 3,
      currentGame: JSON.stringify(currentGame, null, 2)
    });
    return (
      <GameScreen
        prizeName={currentGame.name}
        prizeDescription={currentGame.description}
        locationName={currentGame.location_name || 'Game Store'}
        doorCount={
          currentGame.name.toLowerCase().includes('target') || 
          currentGame.description.toLowerCase().includes('target') ||
          currentGame.location_name?.toLowerCase().includes('target')
            ? 5
            : typeof currentGame.doors === 'number' ? currentGame.doors : 3
        }
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

  // Extract first name from user data
  const getFirstName = () => {
    if (!user?.user_metadata?.full_name) return undefined
    return user.user_metadata.full_name.split(" ")[0]
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Header variant="home" userName={getFirstName()} showLogo={true} />
      
      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Only show these sections when NOT searching */}
        {!searchText && (
          <>
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

            {/* Earned Rewards Section */}
            <EarnedRewardsSection earnedDoors={earnedDoors} />
          </>
        )}

        {/* Search Bar - Now positioned after Earned Rewards */}
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
                created_at: new Date().toISOString(),
                location_name: 'Target',
                address: 'Online',
                stock_quantity: 10
              })}
            />
          </>
        )}

        {/* Available Games header and Filter button row - Only show when not searching */}
        {!searchText && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 }}>
            <Text className="text-gray-900 text-xl font-semibold" style={{ marginBottom: 0, textAlign: 'left', flex: 1, paddingLeft: 0, marginLeft: 0 }}>
              Available games
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
        )}

        {/* Search Results header - Only show when searching */}
        {searchText && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 }}>
            <Text className="text-gray-900 text-xl font-semibold" style={{ marginBottom: 0, textAlign: 'left', flex: 1, paddingLeft: 0, marginLeft: 0 }}>
              Search Results
            </Text>
          </View>
        )}

        {/* Collapsible Filter/Sort Bar - Only show when not searching */}
        {!searchText && showFilters && (
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

      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}