// src/components/game/GameCard.tsx
import { DoorOpen, Heart, MapPin, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { favoritesService } from '../../services/favoritesService';
import { Prize } from '../../services/gameLogic/games';
import { supabase } from '../../services/supabase/client';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Props {
  prize: Prize;
  onPress: () => void;
  userLocation?: Coordinates | null;
  variant?: "default" | "featured";
}

// Helper function to format category for display
const formatCategory = (category?: string): string => {
  if (!category) return 'Food & Drinks';
  
  switch (category) {
    case 'food_and_dining': return 'Food & Dining';
    case 'coffee_and_drinks': return 'Coffee & Drinks';
    case 'shopping': return 'Shopping';
    case 'entertainment': return 'Entertainment';
    case 'fitness_and_health': return 'Fitness & Health';
    case 'beauty_and_wellness': return 'Beauty & Wellness';
    default: return 'Food & Drinks';
  }
};

// Helper function to get category color
const getCategoryColor = (category?: string): { bg: string; text: string } => {
  if (!category) return { bg: '#f0f9ff', text: '#0369a1' };
  
  switch (category) {
    case 'food_and_dining': return { bg: '#fef3c7', text: '#d97706' };
    case 'coffee_and_drinks': return { bg: '#e0f2fe', text: '#0284c7' };
    case 'shopping': return { bg: '#f3e8ff', text: '#7c3aed' };
    case 'entertainment': return { bg: '#e0f2fe', text: '#0284c7' };
    case 'fitness_and_health': return { bg: '#dcfce7', text: '#16a34a' };
    case 'beauty_and_wellness': return { bg: '#fce7f3', text: '#ec4899' };
    default: return { bg: '#f0f9ff', text: '#0369a1' };
  }
};

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
const calculateDistance = (
  userLocation: Coordinates | null, 
  address: string | undefined,
  locationEnabled: boolean = true
): string => {
  if (!locationEnabled) {
    return 'N/A';
  }
  
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

export default function GameCard({ prize, onPress, userLocation, variant = "default" }: Props) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [distance, setDistance] = useState<string>('N/A');

  // Get door count directly from the database (prize.doors)
  // Defaults to 3 if not specified
  const doorCount = typeof prize.doors === 'number' ? prize.doors : 3;

  // Load location enabled status
  useEffect(() => {
    if (!user?.id) return;
    
    const loadLocationSetting = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('location_enabled')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        const enabled = data.location_enabled ?? true; // Default to true if not set
        setLocationEnabled(enabled);
        const calculatedDistance = calculateDistance(userLocation || null, prize.address, enabled);
        setDistance(calculatedDistance);
      } else {
        // Default to enabled if no setting found
        const calculatedDistance = calculateDistance(userLocation || null, prize.address, true);
        setDistance(calculatedDistance);
      }
    };
    
    loadLocationSetting();
  }, [user?.id, userLocation, prize.address]);

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

  const categoryColors = getCategoryColor(prize.category);
  const formattedCategory = formatCategory(prize.category);

  if (variant === "featured") {
    return (
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#14b8a6',
            borderRadius: 24,
            overflow: 'hidden',
            shadowColor: '#14b8a6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Premium badge */}
          <View style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
            <View style={{
              backgroundColor: 'white',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Star size={16} color="#14b8a6" />
              <Text style={{ color: '#14b8a6', fontSize: 14, fontWeight: 'bold' }}>
                TODAY'S SPECIAL
              </Text>
            </View>
          </View>

          {/* Favorite button */}
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={loadingFavorite}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              padding: 10,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
            activeOpacity={0.7}
          >
            <Heart
              size={24}
              color={favorited ? '#ef4444' : 'white'}
              fill={favorited ? '#ef4444' : 'none'}
            />
          </TouchableOpacity>

          <View style={{ padding: 20, paddingTop: 56 }}>
            {/* Company logo section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 56,
                height: 56,
                backgroundColor: 'white',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}>
                {prize.logo_url ? (
                  <Image
                    source={{ uri: prize.logo_url }}
                    style={{ width: 48, height: 48, resizeMode: 'contain' }}
                    onError={handleImageError}
                  />
                ) : (
                  <Text style={{ fontSize: 32 }}>{getIconForPrize(prize.prize_type, prize.name).icon}</Text>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                {/* Main title: free item/service */}
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>
                  {prize.name || 'Free Reward'}
                </Text>
                {/* Subtitle: company name */}
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '500', marginBottom: 8 }}>
                  {prize.company_name || 'OpenDoors'}
                </Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                    {formattedCategory}
                  </Text>
                </View>
              </View>
            </View>

            {/* Location and Door Count */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MapPin size={18} color="white" style={{ marginRight: 6 }} />
                <Text style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>
                  {distance}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <DoorOpen size={16} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
                  {doorCount} door{doorCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Play button */}
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'white',
                paddingVertical: 12,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <Text style={{ color: '#14b8a6', fontSize: 16, fontWeight: 'bold' }}>
                Play Now
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Default card
  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: 'white',
          borderRadius: 24,
          overflow: 'hidden',
          shadowColor: '#14b8a6',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 10,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.04)',
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <View style={{ padding: 20 }}>
          {/* Header with logo and favorite */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {/* Company logo container - bigger, less padding */}
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderWidth: 2,
                borderColor: 'rgba(20, 184, 166, 0.1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
                overflow: 'hidden',
              }}>
                {prize.logo_url ? (
                  <Image
                    source={{ uri: prize.logo_url }}
                    style={{ width: 48, height: 48, resizeMode: 'contain' }}
                    onError={handleImageError}
                  />
                ) : (
                  <Text style={{ fontSize: 32 }}>{getIconForPrize(prize.prize_type, prize.name).icon}</Text>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                {/* Main title: free item/service */}
                <Text style={{ color: '#111827', fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>
                  {prize.name || 'Free Reward'}
                </Text>
                {/* Subtitle: company name */}
                <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '500', marginBottom: 8 }}>
                  {prize.company_name || 'OpenDoors'}
                </Text>
                <View style={{
                  backgroundColor: categoryColors.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ color: categoryColors.text, fontSize: 13, fontWeight: '600' }}>
                    {formattedCategory}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={toggleFavorite}
              disabled={loadingFavorite}
              style={{
                padding: 10,
                borderRadius: 20,
                backgroundColor: favorited ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                shadowColor: favorited ? '#ef4444' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: favorited ? 0.2 : 0,
                shadowRadius: 8,
                elevation: favorited ? 4 : 0,
              }}
              activeOpacity={0.7}
            >
              <Heart
                size={24}
                color={favorited ? '#ef4444' : '#9ca3af'}
                fill={favorited ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>
          </View>

          {/* Location and Door Count */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MapPin size={18} color="#6b7280" style={{ marginRight: 6 }} />
              <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '500' }}>
                {distance}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DoorOpen size={16} color="#6b7280" style={{ marginRight: 4 }} />
              <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
                {doorCount} door{doorCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Play button */}
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#14b8a6',
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: '#14b8a6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Play Now
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}