// src/utils/distance.ts

export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  /**
   * Get user's current location using device GPS
   * Returns a promise that resolves to coordinates or null if permission denied/error
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