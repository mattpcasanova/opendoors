import { useFocusEffect } from '@react-navigation/native';
import { GamepadIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PastGameCard from '../../components/PastGameCard';
import BottomNavBar from '../../components/main/BottomNavBar';
import Header from '../../components/main/Header';
import DistributorHistoryView from '../../components/organization/DistributorHistoryView';
import { useAuth } from '../../hooks/useAuth';
import { GamePlay, historyService, UserStats } from '../../services/historyService';
import { getUserProfileWithRetry, testSupabaseConnection } from '../../utils/supabaseHelpers';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userType, setUserType] = useState<'user' | 'distributor' | 'admin'>('user');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [doorsAvailable, setDoorsAvailable] = useState(0);
  const [doorsDistributed, setDoorsDistributed] = useState(0);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    // Listen for refresh events (e.g., when game is completed)
    const subscription = DeviceEventEmitter.addListener('REFRESH_HISTORY', fetchHistory);
    
    return () => {
      subscription.remove();
    };
  }, [user]);

  // Refresh when screen comes into focus (e.g., navigating back from game)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchHistory();
      }
    }, [user])
  );

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎮 Fetching history for user:', user?.id);
      
      // Test connection first with retry logic
      console.log('🔍 Testing Supabase connection...');
      const connectionOk = await testSupabaseConnection();
      
      if (!connectionOk) {
        setError('Connection failed. Please check your internet connection and try again.');
        setLoading(false);
        return;
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
    } catch (err: any) {
      console.error('❌ Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStats = () => (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 20,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    }}>
      <View style={{
        width: 64,
        height: 64,
        backgroundColor: '#E6FFFA',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <GamepadIcon size={32} color="#009688" strokeWidth={2} />
      </View>
      <Text style={{ 
        fontSize: 36, 
        fontWeight: '800', 
        color: '#009688',
        marginBottom: 6,
      }}>
        {stats?.gamesPlayed || 0}
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: '#64748B', 
        textAlign: 'center',
        fontWeight: '500',
      }}>
        Games Played
      </Text>
    </View>
  );

  const renderGameHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Recent Games</Text>
      {gamePlays.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No games played yet</Text>
          <Text style={styles.emptyStateSubtext}>Start playing games to see your history here!</Text>
        </View>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#009688" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>Error: {error}</Text>
        <TouchableOpacity style={{ backgroundColor: '#009688', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 }} onPress={fetchHistory}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render appropriate view based on user type
  console.log('📊 Rendering History Screen:', { userType, organizationId, loading });

  if (userType === 'distributor' && organizationId) {
    console.log('✅ Showing Distributor Dashboard');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <Header variant="page" title="Distributor Dashboard" subtitle="Manage door distributions" />
        <DistributorHistoryView 
          organizationId={organizationId}
          doorsAvailable={doorsAvailable}
          doorsDistributed={doorsDistributed}
          onRefresh={fetchHistory}
        />
        <BottomNavBar />
      </SafeAreaView>
    );
  }


  // Default: Regular user view
  console.log('✅ Showing Regular User History');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Header variant="page" title="History" subtitle="Your game history" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {renderStats()}
        {renderGameHistory()}
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4c669f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  historyContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
}); 