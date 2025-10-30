// src/utils/distance.ts
import * as Location from 'expo-location';

// Re-export Location for reverse geocoding
export { Location };

export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  /**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance in miles to a readable string
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft`; // Convert to feet if less than 0.1 miles
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Geocode an address string to coordinates
 * Returns coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || address.trim() === '') {
    return null;
  }
  
  // Check for online/virtual locations
  const lowerAddress = address.toLowerCase();
  if (lowerAddress.includes('online') || lowerAddress.includes('virtual')) {
    return null; // Return null for online locations
  }
  
  try {
    const geocoded = await Location.geocodeAsync(address);
    
    if (geocoded && geocoded.length > 0) {
      const location = geocoded[0];
      const coords = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      return coords;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error geocoding address:', address, error);
    return null;
  }
}

/**
 * Calculate distance between user location and address
 * Returns formatted distance string or 'N/A'
 */
export async function calculateDistanceToAddress(
  userLocation: Coordinates | null,
  address: string | undefined,
  locationEnabled: boolean = true
): Promise<string> {
  if (!locationEnabled) {
    return 'N/A';
  }
  
  if (!userLocation || !address) {
    return 'N/A';
  }
  
  // Geocode the address to get coordinates
  const addressCoords = await geocodeAddress(address);
  
  if (!addressCoords) {
    // If geocoding fails (e.g., online location), return 'Online' or 'N/A'
    const lowerAddress = address.toLowerCase();
    if (lowerAddress.includes('online') || lowerAddress.includes('virtual')) {
      return 'Online';
    }
    return 'N/A';
  }
  
  // Calculate distance using Haversine formula
  const distanceInMiles = calculateDistanceInMiles(
    userLocation.latitude,
    userLocation.longitude,
    addressCoords.latitude,
    addressCoords.longitude
  );
  
  return formatDistance(distanceInMiles);
}

/**
 * Get user's current location using device GPS (for web compatibility)
 * Note: For React Native, use expo-location directly
   */
  export async function getCurrentLocation(): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location access denied or unavailable:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }