// src/hooks/useLocation.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setErrorMsg('Location services are disabled. Please enable them in Settings.');
        setLocation(null);
        return;
      }

      // Check current permission
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        // Request if not granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLocation(null);
          return;
        }
      }

      // Get current position
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setErrorMsg(null);
    } catch (error: any) {
      // Handle specific error cases
      const errorMessage = error?.message || 'Unknown error';
      
      // Don't log as error if it's a common/expected issue
      if (errorMessage.includes('Cannot obtain current location') || 
          errorMessage.includes('timeout') ||
          errorMessage.includes('Location unavailable')) {
        console.warn('Location unavailable:', errorMessage);
        setErrorMsg('Location unavailable. Please check your GPS settings.');
      } else {
        console.error('Location error:', error);
        setErrorMsg('Error getting location');
      }
      setLocation(null);
    }
  };

  useEffect(() => {
    fetchLocation();

    // Refresh on app foreground
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        fetchLocation();
      }
    });

    return () => sub.remove();
  }, []);

  return { location, errorMsg };
};