import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants';

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
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  leftSection: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    resizeMode: 'contain',
  },
  logoEmoji: {
    fontSize: 32,
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
    borderColor: Colors.white,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gameDate: {
    fontSize: 13,
    color: Colors.gray600,
    fontWeight: '500',
  },
  resultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prizeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
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
    color: Colors.gray600,
    marginLeft: Spacing.xs,
    flex: 1,
    fontWeight: '500',
  },
}); 