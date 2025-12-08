import { useFocusEffect } from '@react-navigation/native';
import { GamepadIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    DeviceEventEmitter,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import PastGameCard from '../../components/PastGameCard';
import BottomNavBar from '../../components/main/BottomNavBar';
import Header from '../../components/main/Header';
import { LoadingSpinner, SkeletonPastGameCard, EmptyState } from '../../components/ui';
import DistributorHistoryView from '../../components/organization/DistributorHistoryView';
import { useAuth } from '../../hooks/useAuth';
import { GamePlay, historyService, UserStats } from '../../services/historyService';
import { getUserProfileWithRetry, testSupabaseConnection } from '../../utils/supabaseHelpers';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants';

type HistoryTab = 'games' | 'distributions';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userType, setUserType] = useState<'user' | 'distributor' | 'admin'>('user');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [doorsAvailable, setDoorsAvailable] = useState(0);
  const [doorsDistributed, setDoorsDistributed] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<HistoryTab>('distributions');

  // Load saved tab preference
  useEffect(() => {
    const loadTabPreference = async () => {
      try {
        const savedTab = await AsyncStorage.getItem('history_active_tab');
        if (savedTab === 'games' || savedTab === 'distributions') {
          setActiveTab(savedTab);
        }
      } catch (error) {
        console.error('Error loading tab preference:', error);
      }
    };
    loadTabPreference();
  }, []);

  // Save tab preference when it changes
  const handleTabChange = async (tab: HistoryTab) => {
    setActiveTab(tab);
    try {
      await AsyncStorage.setItem('history_active_tab', tab);
    } catch (error) {
      console.error('Error saving tab preference:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    // Listen for refresh events (e.g., when game is completed)
    const subscription = DeviceEventEmitter.addListener('REFRESH_HISTORY', () => fetchHistory(true));

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Refresh when screen comes into focus (but only if data is stale)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;

      // Only refetch if:
      // 1. We have data and it's been more than 30 seconds
      // 2. We've never fetched before (lastFetchTime === 0) and not currently loading
      if (gamePlays.length > 0 && timeSinceLastFetch > 30000) {
        fetchHistory(true); // Background refresh
      } else if (lastFetchTime === 0 && !loading) {
        // Initial load only
        fetchHistory();
      }
    }, [user, lastFetchTime, gamePlays.length, loading])
  );

  const fetchHistory = async (backgroundRefresh: boolean = false) => {
    try {
      // Only show loading spinner on initial load, not background refresh
      if (!backgroundRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      console.log('🎮 Fetching history for user:', user?.id, backgroundRefresh ? '(background)' : '');

      // Skip connection test on background refresh for speed
      if (!backgroundRefresh) {
        console.log('🔍 Testing Supabase connection...');
        const connectionOk = await testSupabaseConnection();

        if (!connectionOk) {
          setError('Connection failed. Please check your internet connection and try again.');
          setLoading(false);
          return;
        }
      }

      // Fetch user profile to get user type and organization with retry logic
      console.log('👤 Fetching profile for user:', user!.id);
      
      const { data: profile, error: profileError } = await getUserProfileWithRetry(user!.id);

      console.log('👤 Profile query result:', { profile, error: profileError });

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        // Set defaults even on error to prevent crashes
        setUserType('user');
        setOrganizationId(null);
        setDoorsAvailable(0);
        setDoorsDistributed(0);
      } else if (profile) {
        console.log('✅ User profile loaded successfully:', {
          user_type: profile.user_type,
          organization_id: profile.organization_id,
          doors_available: profile.doors_available,
          doors_distributed: profile.doors_distributed
        });
        setUserType(profile.user_type || 'user');
        setOrganizationId(profile.organization_id);
        setDoorsAvailable(profile.doors_available || 0);
        setDoorsDistributed(profile.doors_distributed || 0);
      } else {
        // No profile found, use defaults
        console.log('⚠️ No profile data returned, using defaults');
        setUserType('user');
        setOrganizationId(null);
        setDoorsAvailable(0);
        setDoorsDistributed(0);
      }

      // Fetch both game plays and stats in parallel (for regular users)
      const [gamePlaysResult, statsResult] = await Promise.all([
        historyService.getUserGamePlays(user!.id),
        historyService.getUserStats(user!.id)
      ]);
      if (gamePlaysResult.error) throw new Error(gamePlaysResult.error);
      if (statsResult.error) throw statsResult.error;
      
      // Map the game plays data correctly
      const mappedGamePlays = (gamePlaysResult.data || []).map(gp => {
        return {
          id: gp.id,
          created_at: gp.created_at,
          win: gp.win,
          prize: {
            name: gp.prize?.name || 'Unknown Prize',
            location_name: gp.prize?.location_name || 'Unknown Location',
            logo_url: gp.prize?.logo_url
          }
        };
      });

      console.log('🎮 Loaded', mappedGamePlays.length, 'game plays');
      setGamePlays(mappedGamePlays);
      setStats(statsResult.data || null);
      setLastFetchTime(Date.now());
    } catch (err: any) {
      console.error('❌ Error fetching history:', err);
      // Only set error on initial load, silently fail on background refresh
      if (!backgroundRefresh) {
        setError(err.message);
      } else {
        console.warn('Background refresh failed:', err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderStats = () => (
    <View style={{
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      alignItems: 'center',
      ...Shadows.sm,
      borderWidth: 1,
      borderColor: Colors.gray100,
    }}>
      <View style={{
        width: 64,
        height: 64,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
      }}>
        <GamepadIcon size={32} color={Colors.primary} strokeWidth={2} />
      </View>
      <Text style={{
        fontSize: 36,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 6,
      }}>
        {stats?.gamesPlayed || 0}
      </Text>
      <Text style={{
        fontSize: 16,
        color: Colors.gray600,
        textAlign: 'center',
        fontWeight: '500',
      }}>
        Games Played
      </Text>
    </View>
  );

  const renderToggleBar = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          activeTab === 'distributions' && styles.toggleButtonActive
        ]}
        onPress={() => handleTabChange('distributions')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.toggleButtonText,
          activeTab === 'distributions' && styles.toggleButtonTextActive
        ]}>
          Distributions
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          activeTab === 'games' && styles.toggleButtonActive
        ]}
        onPress={() => handleTabChange('games')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.toggleButtonText,
          activeTab === 'games' && styles.toggleButtonTextActive
        ]}>
          Games
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Recent Games</Text>
      {gamePlays.length === 0 ? (
        <EmptyState variant="no-history" />
      ) : (
        gamePlays.map((game) => (
          <PastGameCard
            key={game.id}
            game={game}
            onPress={() => {
              // Could add navigation to game details in the future
              console.log('Game pressed:', game.id);
            }}
          />
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
        <Header variant="page" title="History" subtitle="Your game history" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Stats skeleton */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.xl,
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.lg,
            alignItems: 'center',
            ...Shadows.sm,
            borderWidth: 1,
            borderColor: Colors.gray100,
          }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: Colors.gray200,
              borderRadius: BorderRadius.full,
              marginBottom: Spacing.md,
            }} />
            <View style={{
              width: 80,
              height: 36,
              backgroundColor: Colors.gray200,
              borderRadius: BorderRadius.sm,
              marginBottom: 6,
            }} />
            <View style={{
              width: 120,
              height: 16,
              backgroundColor: Colors.gray200,
              borderRadius: BorderRadius.sm,
            }} />
          </View>

          {/* Game history skeleton */}
          <View style={styles.historyContainer}>
            <View style={{
              width: 150,
              height: 20,
              backgroundColor: Colors.gray200,
              borderRadius: BorderRadius.sm,
              marginBottom: Spacing.md,
            }} />
            <SkeletonPastGameCard />
            <SkeletonPastGameCard />
            <SkeletonPastGameCard />
          </View>
        </ScrollView>
        <BottomNavBar />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }}>
        <View style={{
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.lg,
          padding: Spacing.xl,
          alignItems: 'center',
          ...Shadows.sm,
          maxWidth: 400,
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: BorderRadius.full,
            backgroundColor: '#FEE2E2',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.lg,
          }}>
            <Ionicons name="alert-circle" size={40} color="#DC2626" />
          </View>
          <Text style={{
            color: Colors.gray900,
            fontSize: 18,
            fontWeight: '600',
            marginBottom: Spacing.sm,
            textAlign: 'center',
          }}>
            Something went wrong
          </Text>
          <Text style={{
            color: Colors.gray600,
            fontSize: 14,
            marginBottom: Spacing.xl,
            textAlign: 'center',
          }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.md,
              ...Shadows.sm,
            }}
            onPress={() => fetchHistory()}
            activeOpacity={0.8}
          >
            <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 16 }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render appropriate view based on user type
  console.log('📊 Rendering History Screen:', { userType, organizationId, loading });

  if (userType === 'distributor' && organizationId) {
    console.log('✅ Showing Distributor Dashboard');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
        <Header variant="page" title="History" subtitle={activeTab === 'distributions' ? 'Manage door distributions' : 'Your game history'} />
        {renderToggleBar()}
        {activeTab === 'distributions' ? (
          <DistributorHistoryView
            organizationId={organizationId}
            doorsAvailable={doorsAvailable}
            doorsDistributed={doorsDistributed}
            onRefresh={fetchHistory}
          />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchHistory(true)}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
          >
            {renderStats()}
            {renderGameHistory()}
          </ScrollView>
        )}
        <BottomNavBar />
      </SafeAreaView>
    );
  }


  // Default: Regular user view
  console.log('✅ Showing Regular User History');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.gray50 }}>
      <Header variant="page" title="History" subtitle="Your game history" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistory(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {renderStats()}
        {renderGameHistory()}
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: Colors.gray900,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray600,
  },
  toggleButtonTextActive: {
    color: Colors.primary,
  },
}); 