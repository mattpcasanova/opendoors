import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
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
import BottomNavBar from '../../components/main/BottomNavBar';
import { useAuth } from '../../hooks/useAuth';
import { GameHistory, historyService, UserStats } from '../../services/historyService';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
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
      // Fetch both game history and stats in parallel
      const [historyResult, statsResult] = await Promise.all([
        historyService.getUserGameHistory(user!.id),
        historyService.getUserStats(user!.id)
      ]);
      if (historyResult.error) throw historyResult.error;
      if (statsResult.error) throw statsResult.error;
      console.log('Fetched gameHistory:', historyResult.data);
      setGameHistory(historyResult.data || []);
      setStats(statsResult.data || null);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.gamesPlayed || 0}</Text>
        <Text style={styles.statLabel}>Games Played</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.rewardsEarned || 0}</Text>
        <Text style={styles.statLabel}>Rewards Earned</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats?.rewardsClaimed || 0}</Text>
        <Text style={styles.statLabel}>Rewards Claimed</Text>
      </View>
    </View>
  );

  const renderGameHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Game History</Text>
      {gameHistory.map((game) => (
        <TouchableOpacity
          key={game.id}
          style={[
            styles.gameCard,
            { backgroundColor: game.won ? '#E8F5E9' : '#FFEBEE' }
          ]}
        >
          <View style={styles.gameHeader}>
            <Text style={styles.gameDate}>
              {format(new Date(game.created_at), 'MMM d, yyyy h:mm a')}
            </Text>
            <Text style={[
              styles.gameResult,
              { color: game.won ? '#2E7D32' : '#C62828' }
            ]}>
              {game.won ? 'Won' : 'Lost'}
            </Text>
          </View>
          <Text style={styles.prizeName}>{game.prize.name}</Text>
          <Text style={styles.locationName}>{game.prize.location_name}</Text>
          <View style={styles.gameDetails}>
            <Text style={styles.detailText}>
              Door {game.chosen_door} → {game.switched ? 'Switched' : 'Stayed'}
            </Text>
            {game.game_duration_seconds && (
              <Text style={styles.detailText}>
                {game.game_duration_seconds}s
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
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
      {/* Header */}
      <LinearGradient colors={['#009688', '#00796B']} style={{ paddingBottom: 20 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 20,
        }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>History</Text>
        </View>
      </LinearGradient>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {renderStats()}
        {renderGameHistory()}
      </ScrollView>
      <BottomNavBar initialTab="History" />
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameDate: {
    fontSize: 12,
    color: '#666',
  },
  gameResult: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  prizeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
}); 