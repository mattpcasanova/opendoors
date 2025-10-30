// src/hooks/useLocation.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
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
    } catch (error) {
      setErrorMsg('Error getting location');
      console.error('Location error:', error);
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