import { format } from 'date-fns';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface PastGame {
  id: string;
  created_at: string;
  win: boolean;
  prize: {
    name: string;
    location_name: string;
    logo_url?: string;
  };
}

interface PastGameCardProps {
  game: PastGame;
  onPress?: () => void;
}

export default function PastGameCard({ game, onPress }: PastGameCardProps) {
  const prizeName = game.prize?.name || 'Unknown Prize';
  const locationName = game.prize?.location_name || 'Unknown Location';
  const logoUrl = game.prize?.logo_url;

  return (
    <TouchableOpacity
      style={[
        styles.gameCard,
        { backgroundColor: game.win ? '#E8F5E9' : '#FFEBEE', flexDirection: 'row', alignItems: 'center' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Logo section */}
      <View style={{
        width: 64,
        height: 64,
        backgroundColor: logoUrl ? 'white' : '#F3F4F6',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: logoUrl ? 2 : 0,
        borderColor: logoUrl ? '#009688' : 'transparent',
        overflow: 'hidden',
      }}>
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={{ width: 60, height: 60, borderRadius: 30, resizeMode: 'contain' }}
          />
        ) : (
          <Text style={{ fontSize: 32 }}>🎁</Text>
        )}
      </View>
      {/* Info section */}
      <View style={{ flex: 1 }}>
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
      </View>
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