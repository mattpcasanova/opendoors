import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface PastGame {
  id: string;
  created_at: string;
  win: boolean;
  prize: {
    name: string;
    location_name: string;
  };
}

interface PastGameCardProps {
  game: PastGame;
  onPress?: () => void;
}

export default function PastGameCard({ game, onPress }: PastGameCardProps) {
  const prizeName = game.prize?.name || 'Unknown Prize';
  const locationName = game.prize?.location_name || 'Unknown Location';

  return (
    <TouchableOpacity
      style={[
        styles.gameCard,
        { backgroundColor: game.win ? '#E8F5E9' : '#FFEBEE' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.gameHeader}>
        <Text style={styles.gameDate}>
          {format(new Date(game.created_at), 'MMM d, yyyy h:mm a')}
        </Text>
        <Text style={[
          styles.gameResult,
          { color: game.win ? '#2E7D32' : '#C62828' }
        ]}>
          {game.win ? 'Won' : 'Lost'}
        </Text>
      </View>
      <Text style={styles.prizeName}>{prizeName}</Text>
      <Text style={styles.locationName}>{locationName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  },
}); 