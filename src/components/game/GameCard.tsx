// src/components/game/GameCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { favoritesService } from '../../services/favoritesService';
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

interface SpecialGameCardProps {
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

const handleImageError = (e: any) => {
  // Handle image load error silently
};

// Component to render logo or fallback to emoji
const CompanyLogo = ({ prize }: { prize: Prize }) => {
  const { icon } = getIconForPrize(prize.prize_type, prize.name);

  if (prize.logo_url) {
    return (
      <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
        <Image
          source={{ uri: prize.logo_url }}
          className="w-8 h-8"
          style={{
            resizeMode: 'contain',
          }}
          onError={handleImageError}
        />
      </View>
    );
  }
  
  // Fallback to emoji
  return (
    <View style={{
      width: 64, // Increased from 48
      height: 64, // Increased from 48
      backgroundColor: 'white',
      borderRadius: 32, // Half of width/height
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      borderWidth: 2,
      borderColor: '#009688', // Teal border
    }}>
      <Text style={{ fontSize: 32 }}>{icon}</Text>
    </View>
  );
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
  const distance = calculateDistance(userLocation || null, prize.address);
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkFavorite() {
      if (user?.id && prize?.id) {
        const { favorited } = await favoritesService.isFavorited(user.id, prize.id);
        if (mounted) setFavorited(favorited);
      }
    }
    checkFavorite();
    return () => { mounted = false; };
  }, [user?.id, prize?.id]);

  const toggleFavorite = async () => {
    if (!user?.id) return;
    setLoadingFavorite(true);
    if (favorited) {
      await favoritesService.removeFavorite(user.id, prize.id);
      setFavorited(false);
      console.log(`Removed favorite for prize ${prize.id}`);
    } else {
      await favoritesService.addFavorite(user.id, prize.id);
      setFavorited(true);
      console.log(`Added favorite for prize ${prize.id}`);
    }
    setLoadingFavorite(false);
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'column',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 120,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Main Content Row */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <CompanyLogo prize={prize} />
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', marginRight: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#333',
            }}>
              {prize.location_name || prize.name}
            </Text>
            <TouchableOpacity
              onPress={toggleFavorite}
              disabled={loadingFavorite}
              style={{ marginLeft: 8, padding: 2 }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={favorited ? 'star' : 'star-outline'}
                size={20}
                color={favorited ? '#FFD700' : '#B0B0B0'}
                style={{ marginTop: 1 }}
              />
            </TouchableOpacity>
          </View>
          <Text style={{ 
            fontSize: 13,
            color: '#666',
            lineHeight: 18,
            marginBottom: 6,
          }} numberOfLines={3}>
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
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: 24,
          shadowColor: '#009688',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <Text style={{ 
            color: 'white',
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
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

// Special/Featured Game Card with distance and doors info
export function SpecialGameCard({ prize, onPress, userLocation }: SpecialGameCardProps) {
  const distance = calculateDistance(userLocation || null, prize.address);
  
  const getIconForPrize = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('target')) return '🎯';
    if (lowerName.includes('gift')) return '🎁';
    if (lowerName.includes('movie')) return '🎬';
    if (lowerName.includes('starbucks')) return '☕';
    if (lowerName.includes('chick')) return '🐔';
    return '⭐';
  };

  const formatValue = (value: number) => {
    return value >= 1 ? `${Math.floor(value)}` : `${value.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={{
        marginBottom: 32,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Gradient Background */}
      <View style={{
        backgroundColor: '#FF9800',
        padding: 24,
        position: 'relative',
      }}>
        {/* Decorative element */}
        <View style={{
          position: 'absolute',
          top: '-50%',
          right: -20,
          width: 100,
          height: '200%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          transform: [{ rotate: '15deg' }],
          opacity: 0.3,
        }} />
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: 'white',
              fontSize: 24,
              fontWeight: '700',
              marginBottom: 8,
            }}>
              {prize.location_name || prize.name}
            </Text>
            <Text style={{
              color: 'white',
              fontSize: 16,
              marginBottom: 4,
              opacity: 0.95,
            }}>
              {prize.description}
            </Text>
            <Text style={{
              color: '#FFE0B2',
              fontSize: 14,
              marginBottom: 16,
            }}>
              Limited time • {prize.stock_quantity} available
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                alignSelf: 'flex-start',
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 24,
                shadowColor: '#FF9800',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.18,
                shadowRadius: 6,
                elevation: 4,
              }}
              activeOpacity={0.8}
              onPress={onPress}
            >
              <Text style={{
                color: '#FF9800',
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
                Play now
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Company Logo for Special Card */}
          {prize.logo_url ? (
            <View style={{
              width: 72, // Updated to match new size
              height: 72, // Updated to match new size
              backgroundColor: 'white',
              borderRadius: 36, // Half of width/height
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#009688', // Teal border to match regular cards
            }}>
              <Image
                source={{ uri: prize.logo_url }}
                style={{
                  width: 70, // Fill almost the entire space (72 - 4 for border)
                  height: 70, // Fill almost the entire space (72 - 4 for border)
                  resizeMode: 'contain',
                }}
                defaultSource={require('../../../assets/OpenDoorsLogo.png')}
              />
            </View>
          ) : (
            <View style={{
              width: 72, // Updated to match new size
              height: 72, // Updated to match new size
              backgroundColor: 'white',
              borderRadius: 36, // Half of width/height
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#009688', // Teal border to match regular cards
            }}>
              <Text style={{ fontSize: 32, opacity: 0.9 }}>
                {getIconForPrize(prize.name)}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Info Row for Special Card */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.2)',
        }}>
          {/* Distance */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: 'white', marginRight: 6, opacity: 0.8 }}>📍</Text>
            <Text style={{ 
              fontSize: 14, 
              color: 'white', 
              fontWeight: '500',
              opacity: 0.9,
            }}>
              {distance}
            </Text>
          </View>
          
          {/* Doors */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: 'white', marginRight: 6, opacity: 0.8 }}>🚪</Text>
            <Text style={{ 
              fontSize: 14, 
              color: 'white', 
              fontWeight: '500',
              opacity: 0.9,
            }}>
              {prize.doors} door{prize.doors !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Special Badge */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600',
              opacity: 0.9,
            }}>
              ⭐ SPECIAL
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}