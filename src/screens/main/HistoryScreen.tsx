import { GamepadIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PastGameCard from '../../components/PastGameCard';
import BottomNavBar from '../../components/main/BottomNavBar';
import Header from '../../components/main/Header';
import { useAuth } from '../../hooks/useAuth';
import { GamePlay, historyService, UserStats } from '../../services/historyService';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching history for user:', user?.id);
      // Fetch both game plays and stats in parallel
      const [gamePlaysResult, statsResult] = await Promise.all([
        historyService.getUserGamePlays(user!.id),
        historyService.getUserStats(user!.id)
      ]);
      if (gamePlaysResult.error) throw new Error(gamePlaysResult.error);
      if (statsResult.error) throw statsResult.error;
      console.log('Fetched game plays:', gamePlaysResult.data);
      const mappedGamePlays = (gamePlaysResult.data || []).map(gp => ({
        ...gp,
        prize: {
          ...gp.prizes,
          logo_url: gp.prizes?.logo_url,
        },
      }));
      setGamePlays(mappedGamePlays);
      setStats(statsResult.data || null);
    } catch (err: any) {
      console.error('Error fetching history:', err);
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