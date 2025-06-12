// src/components/game/GameCard.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Prize } from '../../services/gameLogic/games';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Props {
  prize: Prize;
  onPress: () => void;
  userLocation?: Coordinates | null;
}

// Helper function to get icon and background color based on prize
const getIconForPrize = (prizeType: string, name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('chick')) return { icon: '🐔', bg: '#FFF3E0' };
  if (lowerName.includes('starbucks')) return { icon: '☕', bg: '#E8F5E8' };
  if (lowerName.includes('mcdonald')) return { icon: '🍟', bg: '#FFF8E1' };
  if (lowerName.includes('target')) return { icon: '🎯', bg: '#FFE5E5' };
  if (lowerName.includes('fruit') || lowerName.includes('veggie')) return { icon: '🌽', bg: '#F1F8E9' };
  
  // Default icons by prize type
  switch (prizeType) {
    case 'food': return { icon: '🍽️', bg: '#FFF3E0' };
    case 'retail': return { icon: '🛍️', bg: '#F3E5F5' };
    case 'entertainment': return { icon: '🎬', bg: '#E3F2FD' };
    case 'digital': return { icon: '💳', bg: '#E8F5E8' };
    default: return { icon: '🎁', bg: '#F5F5F5' };
  }
};

// Simple distance calculation - replace with real geocoding later
const calculateDistance = (userLocation: Coordinates | null, address: string | undefined): string => {
  if (!userLocation || !address) {
    return 'N/A';
  }
  
  // Mock distances based on address keywords for now
  const lowerAddress = address.toLowerCase();
  if (lowerAddress.includes('online') || lowerAddress.includes('target')) return 'Online';
  if (lowerAddress.includes('biscayne') || lowerAddress.includes('downtown')) return '1.2 mi';
  if (lowerAddress.includes('lincoln') || lowerAddress.includes('beach')) return '2.1 mi';
  if (lowerAddress.includes('brickell')) return '0.8 mi';
  if (lowerAddress.includes('ocean')) return '3.2 mi';
  if (lowerAddress.includes('coral gables')) return '4.5 mi';
  if (lowerAddress.includes('wynwood')) return '2.7 mi';
  
  return '1.5 mi'; // Default
};

export default function GameCard({ prize, onPress, userLocation }: Props) {
  const { icon, bg } = getIconForPrize(prize.prize_type, prize.name);
  const distance = calculateDistance(userLocation, prize.address);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20, // Increased padding for more height
        flexDirection: 'column', // Changed to column to accommodate bottom row
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 120, // Added minimum height
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Main Content Row */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16, // Space for bottom row
      }}>
        <View style={{
          width: 48,
          height: 48,
          backgroundColor: bg,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#333', 
            marginBottom: 4 
          }}>
            {prize.location_name || prize.name}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: '#666',
            lineHeight: 20,
          }} numberOfLines={2}>
            {prize.description}
          </Text>
          {prize.doors !== 3 && (
            <Text style={{ 
              fontSize: 12, 
              color: '#009688', 
              fontWeight: '500',
              marginTop: 4
            }}>
              Higher difficulty • More doors
            </Text>
          )}
        </View>
        
        <View style={{
          backgroundColor: '#009688',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 12
        }}>
          <Text style={{ 
            color: 'white', 
            fontSize: 12, 
            fontWeight: '600' 
          }}>
            PLAY
          </Text>
        </View>
      </View>

      {/* Bottom Info Row */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
      }}>
        {/* Distance */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginRight: 4 }}>📍</Text>
          <Text style={{ 
            fontSize: 12, 
            color: '#6B7280', 
            fontWeight: '500' 
          }}>
            {distance}
          </Text>
        </View>
        
        {/* Doors */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginRight: 4 }}>🚪</Text>
          <Text style={{ 
            fontSize: 12, 
            color: '#6B7280', 
            fontWeight: '500' 
          }}>
            {prize.doors} door{prize.doors !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}