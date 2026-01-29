import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Zap, Search, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  DeviceEventEmitter,
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
import { FilterBar } from '../../components/main/FilterBar';
import Header from "../../components/main/Header";
import { LoadingSpinner, SkeletonGameCard, EmptyState } from '../../components/ui';
import EarnRewardModal from '../../components/modals/EarnRewardModal';
import WatchAdModal from '../../components/modals/WatchAdModal';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants';
import { adsService } from '../../services/adsService';
import { analyticsService } from '../../services/analyticsService';
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
              <Ionicons name="checkmark-circle" size={28} color={Colors.white} />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: 'bold' }}>Played Today</Text>
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
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 24,
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: 480,
            alignSelf: 'center',
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(45,212,191,0.12)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="gift" size={28} color={Colors.white} style={{ opacity: 0.9 }} />
              </View>
              <View>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: 'bold' }}>Play Your Free Daily Game!</Text>
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
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: Colors.black,
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
            color: Colors.gray900,
            marginBottom: 4
          }}>
            Earned Rewards
          </Text>
          <Text style={{
            fontSize: 14,
            color: Colors.gray600
          }}>
            Extra doors available
          </Text>
        </View>

        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: Colors.primary,
          backgroundColor: 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: Colors.primary,
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
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 24,
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: 480,
            alignSelf: 'center',
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(45,212,191,0.12)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="gift" size={28} color={Colors.white} style={{ opacity: 0.9 }} />
              </View>
              <View>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: 'bold' }}>Bonus Available!</Text>
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
      <View style={{ backgroundColor: Colors.white, borderRadius: 24, padding: 24, shadowColor: Colors.black, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: Colors.gray200, width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ color: Colors.gray900, fontSize: 18, fontWeight: '600' }}>Progress to Bonus</Text>
            <Text style={{ color: Colors.gray600, fontSize: 14 }}>
              {gamesUntilBonus} more game{gamesUntilBonus !== 1 ? 's' : ''} to unlock
            </Text>
          </View>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: Colors.primary,
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gift size={28} color={Colors.primary} />
          </View>
        </View>
        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ height: 12, backgroundColor: Colors.gray200, borderRadius: 6, overflow: 'hidden' }}>
            <LinearGradient
              colors={[Colors.primary, Colors.success]}
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
                    ? Colors.primary
                    : i === completedGames
                    ? Colors.primaryLight
                    : Colors.gray300,
                transform: [
                  { scale: i < completedGames ? 1.15 : 1 },
                ],
                borderWidth: i === completedGames ? 2 : 0,
                borderColor: i === completedGames ? Colors.primaryLightest : 'transparent',
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ fontSize: 12, color: Colors.gray600 }}>Start</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Zap size={14} color={Colors.warning} />
            <Text style={{ fontSize: 12, color: Colors.gray600, marginLeft: 2 }}>Bonus</Text>
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
  const [featuredGames, setFeaturedGames] = useState<Prize[]>([]);
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
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const { user, session } = useAuth();
  const [showDoorNotifications, setShowDoorNotifications] = useState(false);
  const [doorNotificationData, setDoorNotificationData] = useState<{ distributorName: string; doorsSent: number; reason?: string; notificationId: string } | null>(null);
  const [showBonusNotification, setShowBonusNotification] = useState(false);
  const [showEarnedRewardNotification, setShowEarnedRewardNotification] = useState(false);
  const [earnedRewardData, setEarnedRewardData] = useState<{ sourceName: string; doorsEarned: number } | null>(null);

  // Filter/sort state
  const [showFilters, setShowFilters] = useState(false);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]); // Categories to hide (opposite of selected)
  const [distance, setDistance] = useState<string | null>(null); // null = not loaded yet
  const [sortBy, setSortBy] = useState<string | null>(null); // null = not loaded yet
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Default to OFF
  const [refreshGamesCounter, setRefreshGamesCounter] = useState(0); // Trigger to refetch games

  // Get user preference categories for emphasis
  const [userPreferenceCategories, setUserPreferenceCategories] = useState<string[]>([]);

  const categories = ['Food', 'Drinks', 'Activities', 'Wellness', 'Retail', 'Entertainment', 'Other'];

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

  // Helper function to map database category to display format
  const mapDBCategoryToDisplay = (dbCategory?: string): string => {
    if (!dbCategory) return 'Other';

    switch (dbCategory) {
      case 'food_and_dining': return 'Food';
      case 'coffee_and_drinks': return 'Drinks';
      case 'fitness_and_health': return 'Activities';
      case 'beauty_and_wellness': return 'Wellness';
      case 'shopping': return 'Retail';
      case 'retail': return 'Retail';
      case 'entertainment': return 'Entertainment';
      default: return 'Other';
    }
  };

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
        } else {
          // No saved preferences - use defaults
          setDistance('Any');
          setSortBy('Closest');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [user?.id]);

  // Notifications: check unread on mount/login and subscribe to realtime inserts
  useEffect(() => {
    // Helper to show a door notification with guards
    const showDoorNotification = (notification: {
      id: string;
      distributor_name: string;
      doors_sent: number;
      reason?: string | null;
    }) => {
      // Guard: Don't show if already showing one
      if (isShowingDoorNotificationRef.current) {
        return;
      }

      // Guard: Validate data exists
      if (!notification.distributor_name || !notification.doors_sent || notification.doors_sent <= 0) {
        return;
      }

      isShowingDoorNotificationRef.current = true;

      setDoorNotificationData({
        distributorName: notification.distributor_name,
        doorsSent: notification.doors_sent,
        reason: notification.reason || undefined,
        notificationId: notification.id
      });
      setShowDoorNotifications(true);
    };

    const init = async () => {
      if (!user?.id) return;

      const result = await notificationService.getUnreadNotifications(user.id);
      if (result.data && result.data.length > 0) {
        // Filter out bonus notifications - they have their own popup component
        const filteredNotifications = result.data.filter(n =>
          !(n.distributor_name === 'OpenDoors' && n.reason === 'Bonus play available! Play any game for free.')
        );

        if (filteredNotifications.length > 0) {
          showDoorNotification(filteredNotifications[0]);
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
        // Guard: Don't process if already showing
        if (isShowingDoorNotificationRef.current) {
          return;
        }

        const result = await notificationService.getUnreadNotifications(user.id);
        if (result.data && result.data.length > 0) {
          const filteredNotifications = result.data.filter(n =>
            !(n.distributor_name === 'OpenDoors' && n.reason === 'Bonus play available! Play any game for free.')
          );

          if (filteredNotifications.length > 0) {
            showDoorNotification(filteredNotifications[0]);
          }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'earned_rewards',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadEarnedRewards();
      })
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
  const distanceOptions = ['Any', '5 mi', '10 mi', '25 mi', '50 mi'];
  const sortOptions = ['Closest', 'Highest Value', 'Most Popular', 'Suggested'];

  // Calculate category counts for badges
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat] = filteredGames.filter(game => mapDBCategoryToDisplay(game.category) === cat).length;
    });
    return counts;
  }, [filteredGames]);

  const currentGameIsBonus = useRef(false);
  const isShowingDoorNotificationRef = useRef(false);

  // Load earned rewards and update count
  const loadEarnedRewards = async () => {
    if (!user?.id) {
      return;
    }

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

  // Listen for games refresh events (e.g., after winning a game, stock changes)
  useEffect(() => {
    const refreshGamesListener = DeviceEventEmitter.addListener('REFRESH_GAMES', () => {
      setRefreshGamesCounter(prev => prev + 1);
    });

    return () => {
      refreshGamesListener.remove();
    };
  }, []);

  // NUCLEAR TEST: Cleanup useEffect DISABLED
  // useEffect(() => {
  //   console.log('🔄 HomeScreen cleanup useEffect triggered');
  //   console.log('  showDoorNotifications:', showDoorNotifications);
  //   console.log('  doorNotificationData:', doorNotificationData ? 'exists' : 'null');
  //   console.log('  cleanupInProgress:', cleanupInProgressRef.current);

  //   if (!showDoorNotifications && doorNotificationData && !cleanupInProgressRef.current) {
  //     console.log('🧹 HomeScreen - Modal just closed, starting cleanup');
  //     cleanupInProgressRef.current = true;

  //     // Modal just closed, do cleanup
  //     const notificationId = doorNotificationData.notificationId;

  //     console.log('🗑️ HomeScreen - Clearing doorNotificationData');
  //     // Clear the data
  //     setDoorNotificationData(null);

  //     // Only mark as read - DON'T call loadEarnedRewards
  //     // The realtime listener will handle updating earned rewards automatically
  //     if (notificationId) {
  //       console.log('📝 HomeScreen - Marking notification as read:', notificationId);
  //       notificationService.markNotificationAsRead(notificationId)
  //         .catch(err => console.error('❌ Error marking notification as read:', err));
  //     }
  //     console.log('✅ HomeScreen - Cleanup completed');

  //     // Reset cleanup flag after a delay
  //     setTimeout(() => {
  //       console.log('🔓 HomeScreen - Cleanup flag reset, ready for next notification');
  //       cleanupInProgressRef.current = false;
  //     }, 500);
  //   }
  // }, [showDoorNotifications, doorNotificationData]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, let's see all active games
        const allGamesResult = await gamesService.getActiveGames();
        
        const [featuredResult, regularResult] = await Promise.all([
          gamesService.getFeaturedGames(),
          gamesService.getRegularGames()
        ]);

        if (featuredResult.error) {
          console.error('❌ Error fetching featured games:', featuredResult.error);
        } else {
          setFeaturedGames(featuredResult.data);
        }

        if (regularResult.error) {
          console.error('❌ Error fetching regular games:', regularResult.error);
          setError('Failed to load games. Please try again.');
        } else {
          const games = regularResult.data || [];
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
  }, [refreshGamesCounter]);

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
    }

    // Filter by favorites if enabled (showOnlyFavorites defaults to true)
    if (showOnlyFavorites && favoritePrizeIds.length > 0) {
      // Only show favorites
      filtered = filtered.filter(game => favoritePrizeIds.includes(game.id));
    }

    // Filter by excluded categories (hide games in these categories)
    if (excludedCategories.length > 0) {
      const dbExcludedCategories = excludedCategories.map(mapCategoryToDBFormat);
      filtered = filtered.filter(game => {
        if (!game.category) return true; // Show games without categories
        return !dbExcludedCategories.includes(game.category); // Hide if in excluded list
      });
    }

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
          // Since plays column doesn't exist, sort by value as fallback
          return (b.prize.value || 0) - (a.prize.value || 0);
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

    // Use first featured game from database (marked with is_special = true)
    if (!featuredGames || featuredGames.length === 0) {
      console.error('❌ No featured games available');
      Alert.alert('No Game Available', 'There is no special game available at this time. Please try again later.');
      return;
    }

    // Use the first featured game (they're already sorted by value descending)
    setCurrentGame(featuredGames[0]);
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

      // Track analytics for game played
      analyticsService.trackGamePlayed(user.id, {
        prizeName: currentGame.name,
        prizeCategory: currentGame.category,
        won,
      }).catch(err => console.error('Analytics error:', err));

      // Check if this is first game or first win for analytics
      const { data: gameHistory } = await supabase
        .from('game_history')
        .select('id, won')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const isFirstGame = gameHistory && gameHistory.length === 1;
      const isFirstWin = won && gameHistory && gameHistory.filter(g => g.won).length === 1;

      if (isFirstGame) {
        analyticsService.trackFirstGame(user.id, {
          prizeName: currentGame.name,
          prizeCategory: currentGame.category,
        }).catch(err => console.error('Analytics error:', err));
      }

      if (isFirstWin) {
        analyticsService.trackFirstWin(user.id, {
          prizeName: currentGame.name,
          prizeValue: currentGame.description || 'Prize',
        }).catch(err => console.error('Analytics error:', err));
      }

      // Check and grant referral rewards if this is first game
      const { granted: referralGranted } = await referralService.checkAndGrantReferralRewards(user.id);
      if (referralGranted) {
        // Refresh earned rewards to show new door
        await loadEarnedRewards();
      }

      // Notify history screen to refresh immediately (game was recorded)
      DeviceEventEmitter.emit('REFRESH_HISTORY');

      // If won, notify rewards screen and games list to refresh immediately
      if (won) {
        DeviceEventEmitter.emit('REFRESH_REWARDS');
        DeviceEventEmitter.emit('REFRESH_GAMES');
      }

      // Show compact result modal
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
          Alert.alert(
            'Connection Error',
            'Unable to save your game progress. Please check your internet connection and try again.',
            [{ text: 'OK' }]
          );
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
    // Prevent multiple simultaneous ad loads
    if (isLoadingAd) {
      console.log('[ads] Already loading an ad, ignoring click');
      return;
    }

    setShowEarnRewardModal(false);
    setIsLoadingAd(true);

    try {
      await adsService.init();
      const result = await adsService.showRewardedAd();

      if (result.userEarnedReward && user?.id) {
        const { data: reward, error } = await earnedRewardsService.addAdWatchReward(user.id);
        if (error) {
          console.error('Error adding ad reward:', error);
          Alert.alert('Error', 'Failed to add reward. Please try again.');
          setIsLoadingAd(false);
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
        setIsLoadingAd(false);
        return;
      }
      // If ad didn't grant reward, fall back to mock modal
      setIsLoadingAd(false);
      setShowWatchAdModal(true);
    } catch (e) {
      console.warn('Falling back to mock ad modal:', e);
      // Fall back to mock ad modal for development/testing
      setIsLoadingAd(false);
      setShowWatchAdModal(true);
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
    return (
      <GameScreen
        prizeName={currentGame.name}
        prizeDescription={currentGame.description}
        locationName={currentGame.location_name || 'Game Store'}
        logoUrl={currentGame.logo_url || undefined}
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

  // Show loading spinner on initial load
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" color={Colors.primary} />
        <Text style={{ marginTop: Spacing.lg, fontSize: 16, color: Colors.gray600, fontWeight: '500' }}>
          Loading games...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <Header variant="home" userName={getFirstName()} showLogo={true} />
      
      {/* Main Content */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: Spacing.lg }}
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
        <View style={{ marginBottom: Spacing.xl, marginTop: Spacing.md }}>
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.full,
              paddingHorizontal: Spacing.lg,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: searchText.length > 0 ? Colors.primary : Colors.gray200,
              ...Shadows.sm,
            }}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: searchText.length > 0 ? Colors.primary : Colors.gray100,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: Spacing.sm,
            }}>
              <Search size={20} color={searchText.length > 0 ? Colors.white : Colors.gray600} />
            </View>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: Colors.gray900,
                fontWeight: '500',
              }}
              placeholder="Search games by name or location"
              placeholderTextColor={Colors.gray500}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: Colors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: Spacing.sm,
                }}
                activeOpacity={0.7}
              >
                <X size={18} color={Colors.gray600} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Info */}
        {searchText.length > 0 && (
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={{ color: Colors.gray600, fontSize: 14 }}>
              Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} matching "{searchText}"
            </Text>
          </View>
        )}

        {/* Featured Games - Only show when not searching and featured games exist */}
        {!searchText && featuredGames.length > 0 && (
          <>
            <Text style={{
              color: Colors.gray900,
              fontSize: 20,
              fontWeight: '600',
              marginBottom: Spacing.md,
            }}>
              Featured games
            </Text>
            {featuredGames.map((game) => (
              <GameCard
                key={game.id}
                variant="featured"
                prize={game}
                userLocation={location}
                onPress={() => playGame(game)}
              />
            ))}
          </>
        )}

        {/* Available Games header and Filter button row - Only show when not searching */}
        {!searchText && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, marginTop: Spacing.base }}>
            <Text style={{
              color: Colors.gray900,
              fontSize: 20,
              fontWeight: '600',
              flex: 1,
            }}>
              Available games
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: showFilters ? Colors.primary : Colors.primaryMuted,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.base,
                borderRadius: BorderRadius.full,
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: Spacing.base,
                ...Shadows.sm,
                alignSelf: 'flex-end',
                borderWidth: showFilters ? 2 : 0,
                borderColor: Colors.primary,
              }}
              onPress={() => setShowFilters(f => !f)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={showFilters ? "close" : "filter"}
                size={18}
                color={showFilters ? Colors.white : Colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={{
                color: showFilters ? Colors.white : Colors.primary,
                fontWeight: '600',
                fontSize: 15
              }}>
                {showFilters ? 'Close' : 'Filter'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Results header - Only show when searching */}
        {searchText && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, marginTop: Spacing.base }}>
            <Text style={{
              color: Colors.gray900,
              fontSize: 20,
              fontWeight: '600',
              flex: 1,
            }}>
              Search Results
            </Text>
          </View>
        )}

        {/* Enhanced Filter Bar - Only show when not searching */}
        {!searchText && showFilters && (
          <View style={{ paddingHorizontal: 16 }}>
            <FilterBar
              categories={categories}
              excludedCategories={excludedCategories}
              onExcludedCategoriesChange={setExcludedCategories}
              userPreferenceCategories={userPreferenceCategories}
              showOnlyFavorites={showOnlyFavorites}
              onFavoritesToggle={() => setShowOnlyFavorites(f => !f)}
              categoryCounts={categoryCounts}
              distanceOptions={distanceOptions}
              selectedDistance={distance}
              onDistanceChange={setDistance}
              sortOptions={sortOptions}
              selectedSort={sortBy}
              onSortChange={setSortBy}
            />
          </View>
        )}
        
        {(() => {
          // If we have calculated distances, use sorted list, otherwise use filtered games
          const gamesToDisplay = location && gamesWithDistances.length > 0
            ? gamesWithDistances.map(item => item.prize)
            : filteredGames;
          
          return (
            gamesToDisplay.length === 0 && searchText.length > 0 ? (
              <EmptyState
                variant="no-results"
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: BorderRadius.lg,
                  marginVertical: Spacing.lg,
                  ...Shadows.sm,
                }}
              />
            ) : gamesToDisplay.length === 0 && !searchText ? (
              <EmptyState
                variant="no-games"
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: BorderRadius.lg,
                  marginVertical: Spacing.lg,
                  ...Shadows.sm,
                }}
              />
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

      {showDoorNotifications &&
       doorNotificationData &&
       doorNotificationData.distributorName &&
       doorNotificationData.doorsSent > 0 && (
        <DoorNotificationComponent
          isVisible={true}
          onClose={() => {
            const notificationId = doorNotificationData.notificationId;

            // Mark notification as read
            if (notificationId) {
              notificationService.markNotificationAsRead(notificationId)
                .catch(err => console.error('Error marking notification as read:', err));
            }

            // Reset the guard ref so future notifications can show
            isShowingDoorNotificationRef.current = false;

            // Clear state
            setShowDoorNotifications(false);
            setDoorNotificationData(null);
          }}
          distributorName={doorNotificationData.distributorName}
          doorsSent={doorNotificationData.doorsSent}
          reason={doorNotificationData.reason}
          notificationId={doorNotificationData.notificationId}
        />
      )}

      {/* Ad Loading Overlay */}
      {isLoadingAd && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: Colors.white,
            paddingVertical: 40,
            paddingHorizontal: 32,
            borderRadius: 24,
            alignItems: 'center',
            minWidth: 200,
            ...Shadows.lg,
          }}>
            <LoadingSpinner size="large" color={Colors.primary} />
            <Text style={{
              marginTop: 20,
              fontSize: 18,
              fontWeight: '700',
              color: Colors.gray900,
            }}>
              Loading Ad
            </Text>
            <Text style={{
              marginTop: 8,
              fontSize: 14,
              color: Colors.gray600,
              textAlign: 'center',
              lineHeight: 20,
            }}>
              Please wait while we prepare{'\n'}your reward
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}