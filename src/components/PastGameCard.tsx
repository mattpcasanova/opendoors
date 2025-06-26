import { Ionicons } from '@expo/vector-icons';
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

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 168) {
      return format(date, 'EEE h:mm a');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left side - Logo and result indicator */}
      <View style={styles.leftSection}>
        <View style={[
          styles.logoContainer,
          { borderColor: game.win ? '#10B981' : '#EF4444' }
        ]}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoImage}
            />
          ) : (
            <Text style={styles.logoEmoji}>🎁</Text>
          )}
        </View>
        <View style={[
          styles.resultIndicator,
          { backgroundColor: game.win ? '#10B981' : '#EF4444' }
        ]}>
          <Ionicons 
            name={game.win ? 'checkmark' : 'close'} 
            size={12} 
            color="white" 
          />
        </View>
      </View>
      {/* Right side - Game info */}
      <View style={styles.rightSection}>
        <View style={styles.headerRow}>
          <Text style={styles.gameDate}>
            {formatGameDate(game.created_at)}
          </Text>
          <View style={[
            styles.resultBadge,
            { backgroundColor: game.win ? '#DCFCE7' : '#FEE2E2' }
          ]}>
            <Text style={[
              styles.resultText,
              { color: game.win ? '#166534' : '#DC2626' }
            ]}>
              {game.win ? 'Won' : 'Lost'}
            </Text>
          </View>
        </View>
        <Text style={styles.prizeName} numberOfLines={2}>
          {prizeName}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationName} numberOfLines={1}>
            {locationName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  leftSection: {
    position: 'relative',
    marginRight: 16,
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  logoEmoji: {
    fontSize: 24,
  },
  resultIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prizeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationName: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
}); 