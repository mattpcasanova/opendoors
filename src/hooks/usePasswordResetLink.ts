import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase/client';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

/**
 * Hook to handle password reset deep links
 * When user clicks reset link in email, this captures the token and navigates to reset screen
 */
export function usePasswordResetLink() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Check for initial URL (when app opens from link)
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await handleResetUrl(url);
      }
    };

    // Listen for URL events (when app is already open)
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      await handleResetUrl(url);
    });

    checkInitialUrl();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleResetUrl = async (url: string) => {
    try {
      // Check if this is a password reset URL
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        console.log('🔑 Password reset link detected:', url);

        // Extract the hash fragment which contains the tokens
        const hashMatch = url.match(/#(.+)/);
        if (hashMatch) {
          const hash = hashMatch[1];
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && type === 'recovery') {
            console.log('✅ Valid recovery token found, setting session');

            // Set the session with the tokens from the URL
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              console.error('❌ Error setting session:', error);
            } else {
              console.log('✅ Session set successfully, navigating to reset screen');
              // Navigate to the reset password screen
              navigation.navigate('ResetPassword');
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error handling password reset URL:', error);
    }
  };
}
