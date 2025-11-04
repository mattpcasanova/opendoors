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
import BonusPlayNotification from '../../components/BonusPlayNotification';
import DoorNotificationComponent from '../../components/DoorNotification';
import EarnedRewardNotification from '../../components/EarnedRewardNotification';
import GameCard from '../../components/game/GameCard';
import BottomNavBar from '../../components/main/BottomNavBar';
import Header from "../../components/main/Header";
import EarnRewardModal from '../../components/modals/EarnRewardModal';
import WatchAdModal from '../../components/modals/WatchAdModal';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { adsService } from '../../services/adsService';
import { EarnedReward, earnedRewardsService } from '../../services/earnedRewardsService';
import { gamesService, Prize } from '../../services/gameLogic/games';
import { notificationService } from '../../services/notificationService';
import { referralService } from '../../services/referralService';
import { supabase } from '../../services/supabase/client';
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
      <View
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
      </View>
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
  const [gamesWithDistances, setGamesWithDistances] = useState<Array<{ prize: Prize; distance: number }>>([]);
  
  // Game state tracking
  const [gamesUntilBonus, setGamesUntilBonus] = useState(5);
  const [hasPlayedAnyGameToday, setHasPlayedAnyGameToday] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Prize | null>(null);
  const [lastPlayDate, setLastPlayDate] = useState<string | null>(null);
  const [bonusPlaysAvailable, setBonusPlaysAvailable] = useState(0);
  const [earnedDoors, setEarnedDoors] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([]);
  const [showEarnRewardModal, setShowEarnRewardModal] = useState(false);
  const [showWatchAdModal, setShowWatchAdModal] = useState(false);
  const { user, session } = useAuth();
  const [showDoorNotifications, setShowDoorNotifications] = useState(false);
  const [showBonusNotification, setShowBonusNotification] = useState(false);
  const [showEarnedRewardNotification, setShowEarnedRewardNotification] = useState(false);
  const [earnedRewardData, setEarnedRewardData] = useState<{ sourceName: string; doorsEarned: number } | null>(null);

  // Filter/sort state
  const [showFilters, setShowFilters] = useState(false);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]); // Categories to hide (opposite of selected)
  const [distance, setDistance] = useState<string | null>(null); // null = not loaded yet
  const [sortBy, setSortBy] = useState<string | null>(null); // null = not loaded yet
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Default to OFF
  
  // Get user preference categories for emphasis
  const [userPreferenceCategories, setUserPreferenceCategories] = useState<string[]>([]);

  const categories = ['Food', 'Drinks', 'Activities', 'Wellness', 'Retail', 'Entertainment', 'Other'];

  // Load user preferences to pre-select categories and load filter settings
  useEffect(() => {
    if (!user?.id) return;
    
    const loadUserPreferences = async () => {
      try {
        // Load category preferences
        const { data: prefData, error: prefError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!prefError && prefData) {
          // Map database categories to filter categories
          const prefCategories: string[] = [];
          if (prefData.food_and_dining) prefCategories.push('Food');
          if (prefData.coffee_and_drinks) prefCategories.push('Drinks');
          if (prefData.entertainment) prefCategories.push('Entertainment');
          if (prefData.fitness_and_health) prefCategories.push('Activities');
          if (prefData.beauty_and_wellness) prefCategories.push('Wellness');
          if (prefData.shopping) prefCategories.push('Retail');
          
          if (prefCategories.length > 0) {
            setUserPreferenceCategories(prefCategories); // Store for emphasis (used for visual emphasis only)
            console.log('✅ Loaded user preference categories for emphasis:', prefCategories);
          } else {
            setUserPreferenceCategories([]); // Clear if no preferences
          }
        }
        
        // Load filter settings (distance, sort_by)
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('distance_filter, sort_by, excluded_categories')
          .eq('user_id', user.id)
          .single();
        
        if (!settingsError && settingsData) {
          // Set distance - use saved or default to 'Any'
          setDistance(settingsData.distance_filter || 'Any');
          
          // Set sort_by - use saved or default to 'Closest'
          setSortBy(settingsData.sort_by || 'Closest');
          
          // Load excluded categories (categories user wants to hide)
          if (settingsData.excluded_categories && Array.isArray(settingsData.excluded_categories)) {
            setExcludedCategories(settingsData.excluded_categories);
          }
          
          console.log('✅ Loaded filter preferences:', {
            distance: settingsData.distance_filter || 'Any',
            sortBy: settingsData.sort_by || 'Closest',
            excludedCategories: settingsData.excluded_categories || []
          });
        } else {
          // No saved preferences - use defaults
          setDistance('Any');
          setSortBy('Closest');
          console.log('✅ Using default filter preferences');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [user?.id]);

  // Notifications: check unread on mount/login and subscribe to realtime inserts
  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;
      const result = await notificationService.getUnreadNotifications(user.id);
      if (result.data) {
        // Filter out bonus notifications - they have their own popup component
        const filteredNotifications = result.data.filter(n => 
          !(n.distributor_name === 'OpenDoors' && n.reason === 'Bonus play available! Play any game for free.')
        );
        if (filteredNotifications.length > 0) {
          setShowDoorNotifications(true);
        }
      }
    };
    init();

    if (!user?.id) return;
    const channel = supabase
      .channel(`home_notifications_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'door_notifications',
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        // Check if it's a bonus notification - if so, don't show door notification popup
        const result = await notificationService.getUnreadNotifications(user.id);
        if (result.data) {
          const filteredNotifications = result.data.filter(n => 
            !(n.distributor_name === 'OpenDoors' && n.reason === 'Bonus play available! Play any game for free.')
          );
          if (filteredNotifications.length > 0) {
            setShowDoorNotifications(true);
          }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'earned_rewards',
        filter: `user_id=eq.${user.id}`,
      }, () => setShowDoorNotifications(true))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Listen for preference refresh events (when user updates preferences in profile)
  useEffect(() => {
    if (!user?.id) return;
    
    const refreshListener = DeviceEventEmitter.addListener('REFRESH_USER_PREFERENCES', () => {
      console.log('🔄 Refreshing user preferences from profile update');
      
      // Reload preferences when event is received
      const loadUserPreferences = async () => {
        try {
          // Load category preferences
          const { data: prefData, error: prefError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (!prefError && prefData) {
            // Map database categories to filter categories
            const prefCategories: string[] = [];
            if (prefData.food_and_dining) prefCategories.push('Food');
            if (prefData.coffee_and_drinks) prefCategories.push('Drinks');
            if (prefData.entertainment) prefCategories.push('Entertainment');
            if (prefData.fitness_and_health) prefCategories.push('Activities');
            if (prefData.beauty_and_wellness) prefCategories.push('Wellness');
            if (prefData.shopping) prefCategories.push('Retail');
            
            setUserPreferenceCategories(prefCategories.length > 0 ? prefCategories : []);
            console.log('✅ Refreshed user preference categories:', prefCategories);
          }
        } catch (error) {
          console.error('Error refreshing user preferences:', error);
        }
      };
      
      loadUserPreferences();
    });

    return () => {
      refreshListener.remove();
    };
  }, [user?.id]);
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
  }, [excludedCategories, distance, sortBy, showOnlyFavorites]);

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
          setError('Failed to load games. Please try again.');
        } else {
          const games = regularResult.data || [];
          console.log('✅ Loaded regular games:', games.length);
          setRegularGames(games);
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

  // Helper function to map category string to database category format
  const mapCategoryToDBFormat = (category: string): string => {
    switch (category) {
      case 'Food': return 'food_and_dining';
      case 'Drinks': return 'coffee_and_drinks';
      case 'Activities': return 'fitness_and_health';
      case 'Wellness': return 'beauty_and_wellness';
      case 'Retail': return 'shopping';
      case 'Entertainment': return 'entertainment';
      default: return category.toLowerCase();
    }
  };

  // Get favorites list for filtering
  const [favoritePrizeIds, setFavoritePrizeIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user?.id) {
      setFavoritePrizeIds([]);
      return;
    }
    
    const loadFavorites = async () => {
      const { favoritesService } = await import('../../services/favoritesService');
      const { ids } = await favoritesService.getFavoritePrizeIds(user.id);
      setFavoritePrizeIds(ids);
    };
    
    loadFavorites();
  }, [user?.id]);

  // Filter games based on search text, categories, and favorites
  useEffect(() => {
    if (!regularGames || regularGames.length === 0) {
      setFilteredGames([]);
      return;
    }
    
    let filtered = [...regularGames];
    const initialCount = filtered.length;
    
    // Filter by search text
    if (searchText.length > 0) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(game => {
        const nameMatch = game.name.toLowerCase().includes(searchLower);
        const descriptionMatch = game.description.toLowerCase().includes(searchLower);
        const locationMatch = (game.location_name || '').toLowerCase().includes(searchLower);
        return nameMatch || descriptionMatch || locationMatch;
      });
      console.log(`🔍 After search filter: ${filtered.length} games`);
    }
    
    // Filter by favorites if enabled (showOnlyFavorites defaults to true)
    if (showOnlyFavorites && favoritePrizeIds.length > 0) {
      // Only show favorites
      filtered = filtered.filter(game => favoritePrizeIds.includes(game.id));
      console.log(`⭐ After favorites filter (ON): ${filtered.length} games`);
    } else if (showOnlyFavorites && favoritePrizeIds.length === 0) {
      // Favorites ON but no favorites - show all games (fallback)
      console.log(`⭐ Favorites filter ON but no favorites - showing all games`);
    } else {
      console.log(`⭐ Favorites filter OFF: showing all games`);
    }
    
    // Filter by excluded categories (hide games in these categories)
    if (excludedCategories.length > 0) {
      const dbExcludedCategories = excludedCategories.map(mapCategoryToDBFormat);
      filtered = filtered.filter(game => {
        if (!game.category) return true; // Show games without categories
        return !dbExcludedCategories.includes(game.category); // Hide if in excluded list
      });
      console.log(`🏷️ After excluding categories (${excludedCategories.join(', ')}): ${filtered.length} games`);
      console.log('🏷️ Available game categories:', [...new Set(regularGames.map(g => g.category))]);
    }
    
    console.log(`📊 Total games: ${initialCount}, Filtered to: ${filtered.length}`);
    setFilteredGames(filtered);
  }, [searchText, regularGames, showOnlyFavorites, excludedCategories, favoritePrizeIds]);

  // Save filter preferences when they change
  useEffect(() => {
    if (!user?.id || distance === null || sortBy === null) {
      // Don't save if preferences haven't loaded yet
      return;
    }
    
    const saveFilterPreferences = async () => {
      try {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            distance_filter: distance,
            sort_by: sortBy,
            excluded_categories: excludedCategories,
          }, { onConflict: 'user_id' });
        console.log('💾 Saved filter preferences:', { distance, sortBy, excludedCategories });
      } catch (error) {
        console.error('Error saving filter preferences:', error);
      }
    };
    
    // Debounce saves to avoid too many database calls
    const timeoutId = setTimeout(saveFilterPreferences, 500);
    return () => clearTimeout(timeoutId);
  }, [user?.id, distance, sortBy, excludedCategories]);

  // Calculate distances for sorting and filtering
  useEffect(() => {
    if (!filteredGames.length || distance === null || sortBy === null) {
      // Don't calculate if preferences haven't loaded yet
      setGamesWithDistances([]);
      return;
    }

    const calculateDistances = async () => {
      const { geocodeAddress, calculateDistanceInMiles } = await import('../../utils/distance');
      
      const distances = await Promise.all(
        filteredGames.map(async (prize) => {
          if (!prize.address) {
            return { prize, distance: Infinity }; // Games without addresses go to bottom
          }

          const lowerAddress = prize.address.toLowerCase();
          if (lowerAddress.includes('online') || lowerAddress.includes('virtual')) {
            return { prize, distance: Infinity };
          }

          if (!location) {
            return { prize, distance: Infinity }; // No location = show at bottom
          }

          try {
            const addressCoords = await geocodeAddress(prize.address);
            if (!addressCoords) {
              return { prize, distance: Infinity };
            }

            const calculatedDistance = calculateDistanceInMiles(
              location.latitude,
              location.longitude,
              addressCoords.latitude,
              addressCoords.longitude
            );

            return { prize, distance: calculatedDistance };
          } catch (error) {
            console.error('Error calculating distance for prize:', prize.id, error);
            return { prize, distance: Infinity };
          }
        })
      );

      // Apply distance filtering
      const maxDistance = distance === 'Any' ? Infinity : parseFloat(distance.replace(' mi', ''));
      const filteredByDistance = distances.filter(item => 
        item.distance <= maxDistance || item.distance === Infinity // Keep games without addresses
      );

      // Apply sorting based on sortBy
      const sorted = filteredByDistance.sort((a, b) => {
        if (sortBy === 'Closest') {
          return a.distance - b.distance;
        } else if (sortBy === 'Highest Value') {
          return (b.prize.value || 0) - (a.prize.value || 0);
        } else if (sortBy === 'Most Popular') {
          const playsA = a.prize.plays || 0;
          const playsB = b.prize.plays || 0;
          return playsB - playsA;
        } else if (sortBy === 'Suggested') {
          // Suggested = closest first, but weighted by value
          const scoreA = (a.prize.value || 0) / Math.max(a.distance, 0.1); // Avoid division by zero
          const scoreB = (b.prize.value || 0) / Math.max(b.distance, 0.1);
          return scoreB - scoreA;
        }
        return 0;
      });

      setGamesWithDistances(sorted);
    };

    calculateDistances();
  }, [location, filteredGames, distance, sortBy]);

  const playGame = (prize: Prize) => {
    // Check if user has already played today
    if (hasPlayedAnyGameToday && bonusPlaysAvailable === 0 && earnedDoors === 0) {
      // Show popup to watch ad or refer friend
      setShowEarnRewardModal(true);
      return;
    }
    
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

  const handleGameComplete = async (
    won: boolean,
    switched: boolean,
    chosenDoor: number,
    winningDoor: number,
    revealedDoor: number | null,
    durationSeconds: number
  ) => {
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
        chosen_door: chosenDoor,
        winning_door: winningDoor,
        revealed_door: revealedDoor ?? undefined,
        game_duration_seconds: durationSeconds
      });

      if (gameError) {
        console.error('❌ Error recording game:', gameError);
        Alert.alert('Error', 'Failed to save game result. Please try again.');
        return;
      }

      // Check and grant referral rewards if this is first game
      const { granted: referralGranted } = await referralService.checkAndGrantReferralRewards(user.id);
      if (referralGranted) {
        console.log('✅ Referral rewards granted for first game');
        // Refresh earned rewards to show new door
        await loadEarnedRewards();
        // Show referral notification popup immediately (no delay)
        setShowDoorNotifications(true);
      }

      // Notify history screen to refresh immediately (game was recorded)
      DeviceEventEmitter.emit('REFRESH_HISTORY');

      // If won, notify rewards screen to refresh immediately
      if (won) {
        DeviceEventEmitter.emit('REFRESH_REWARDS');
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
            const hadBonusBefore = bonusPlaysAvailable > 0;
            setGamesUntilBonus(updatedProgress.gamesUntilBonus);
            setLastPlayDate(updatedProgress.lastPlayDate);
            setBonusPlaysAvailable(updatedProgress.bonusPlaysAvailable);
            setHasPlayedAnyGameToday(updatedProgress.hasPlayedToday);
            
            // If bonus just became available, show popup and send notifications
            if (!hadBonusBefore && updatedProgress.bonusPlaysAvailable > 0) {
              // Show bonus popup immediately
              setShowBonusNotification(true);
              
              // Send notifications (in-app and push)
              const { autoNotificationService } = await import('../../services/autoNotificationService');
              await autoNotificationService.checkBonusAvailableNotification(user.id);
            }
          }
        }
      }

      // If used earned door, mark it as claimed
      if (usedEarnedRewardId) {
        const { success, error: claimError } = await earnedRewardsService.claimEarnedReward(usedEarnedRewardId);
        if (claimError || success === false) {
          console.error('❌ Error marking earned reward as claimed:', claimError);
        } else {
          await loadEarnedRewards();
        }
      }

    } catch (error) {
      console.error('❌ Error in handleGameComplete:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleBackFromGame = () => {
    setShowGameScreen(false);
  };

  const handleWatchAd = async () => {
    setShowEarnRewardModal(false);
    try {
      await adsService.init();
      const result = await adsService.showRewardedAd();
      if (result.userEarnedReward && user?.id) {
        const { data: reward, error } = await earnedRewardsService.addAdWatchReward(user.id);
        if (error) {
          console.error('Error adding ad reward:', error);
          Alert.alert('Error', 'Failed to add reward. Please try again.');
          return;
        }
        
        // Show earned reward popup
        if (reward) {
          setEarnedRewardData({
            sourceName: reward.source_name || 'Watch Ad',
            doorsEarned: reward.doors_earned || 1
          });
          setShowEarnedRewardNotification(true);
        }
        
        await loadEarnedRewards();
        return;
      }
      Alert.alert('No reward granted', 'The ad did not grant a reward this time. Please try again.');
    } catch (e) {
      console.warn('Falling back to mock ad modal:', e);
      Alert.alert('Ad unavailable', 'The ad failed to load. Please try again shortly.');
    }
  };

  const handleAdComplete = async () => {
    setShowWatchAdModal(false);
    // Reload earned rewards to update count
    await loadEarnedRewards();
  };

  const handleReferFriend = async () => {
    setShowEarnRewardModal(false);
    // The referral logic is handled in EarnRewardModal
    // Reload earned rewards to update count after referral
    await loadEarnedRewards();
  };

  // If showing game screen, render that instead
  if (showGameScreen && currentGame) {
    console.log('🎮 Starting game with:', {
      name: currentGame.name,
      description: currentGame.description,
      locationName: currentGame.location_name,
      doorCount: typeof currentGame.doors === 'number' ? currentGame.doors : 3,
      currentGame: JSON.stringify(currentGame, null, 2)
    });
    return (
      <GameScreen
        prizeName={currentGame.name}
        prizeDescription={currentGame.description}
        locationName={currentGame.location_name || 'Game Store'}
        doorCount={typeof currentGame.doors === 'number' ? currentGame.doors : 3}
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
            {/* Row 1: Favorites toggle first, then Category chips */}
            <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {/* Favorites toggle chip - First */}
              <TouchableOpacity
                style={{
                  backgroundColor: showOnlyFavorites ? '#009688' : '#E0F7F4',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  marginRight: 8,
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
              {categories.map(cat => {
                const isExcluded = excludedCategories.includes(cat); // Category is hidden/off
                const isUserPreference = userPreferenceCategories.includes(cat);
                
                return (
                  <TouchableOpacity
                    key={cat}
                    style={{
                      backgroundColor: isExcluded ? '#F3F4F6' : (isUserPreference ? '#E0F7F4' : '#E0F7F4'),
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 16,
                      marginRight: 8,
                      borderWidth: isExcluded ? 1 : (isUserPreference ? 2 : 0),
                      borderColor: isExcluded ? '#D1D5DB' : (isUserPreference ? '#10B981' : '#009688'),
                      opacity: isExcluded ? 0.5 : 1,
                    }}
                    onPress={() => setExcludedCategories(excludedCategories.includes(cat)
                      ? excludedCategories.filter(c => c !== cat) // Remove from excluded (show it)
                      : [...excludedCategories, cat])} // Add to excluded (hide it)
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isUserPreference && (
                        <Ionicons 
                          name="star" 
                          size={14} 
                          color={isExcluded ? '#9CA3AF' : '#10B981'} 
                          style={{ marginRight: 4 }} 
                        />
                      )}
                      <Text style={{ 
                        color: isExcluded ? '#9CA3AF' : '#009688', 
                        fontWeight: isUserPreference ? '700' : '600',
                        textDecorationLine: isExcluded ? 'line-through' : 'none',
                      }}>
                        {cat}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </RNScrollView>

            {/* Row 2: Distance segmented control */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, paddingHorizontal: 12 }}>
              {distanceOptions.map(opt => {
                const isSelected = distance === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={{
                      backgroundColor: isSelected ? '#009688' : '#E0F7F4',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 16,
                      marginRight: 8,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: '#009688',
                    }}
                    onPress={() => setDistance(opt)}
                    disabled={distance === null}
                  >
                    <Text style={{ color: isSelected ? 'white' : '#009688', fontWeight: '600' }}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Row 3: Sorting segmented control (horizontal scroll) */}
            <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                {sortOptions.map(opt => {
                  const isSelected = sortBy === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={{
                        backgroundColor: isSelected ? '#009688' : '#E0F7F4',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        marginRight: 8,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: '#009688',
                      }}
                      onPress={() => setSortBy(opt)}
                      disabled={sortBy === null}
                    >
                      <Text style={{ color: isSelected ? 'white' : '#009688', fontWeight: '600' }}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </RNScrollView>
          </View>
        )}
        
        {(() => {
          // If we have calculated distances, use sorted list, otherwise use filtered games
          const gamesToDisplay = location && gamesWithDistances.length > 0
            ? gamesWithDistances.map(item => item.prize)
            : filteredGames;
          
          return (
            gamesToDisplay.length === 0 && searchText.length > 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="search" size={48} color="#999999" />
                <Text className="text-gray-500 text-lg mt-4">No games found</Text>
                <Text className="text-gray-400 text-sm mt-2">Try searching for something else</Text>
              </View>
            ) : (
              gamesToDisplay.map((prize) => (
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

      {/* Modals */}
      <EarnRewardModal
        visible={showEarnRewardModal}
        onClose={() => setShowEarnRewardModal(false)}
        onWatchAd={handleWatchAd}
        onReferFriend={handleReferFriend}
      />

      <WatchAdModal
        visible={showWatchAdModal}
        onClose={() => setShowWatchAdModal(false)}
        onAdComplete={handleAdComplete}
      />

      <DoorNotificationComponent
        isVisible={showDoorNotifications}
        onClose={() => setShowDoorNotifications(false)}
      />

      <BonusPlayNotification
        isVisible={showBonusNotification}
        onClose={() => setShowBonusNotification(false)}
      />

      {earnedRewardData && (
        <EarnedRewardNotification
          isVisible={showEarnedRewardNotification}
          onClose={() => {
            setShowEarnedRewardNotification(false);
            setEarnedRewardData(null);
          }}
          sourceName={earnedRewardData.sourceName}
          doorsEarned={earnedRewardData.doorsEarned}
        />
      )}
    </SafeAreaView>
  );
}