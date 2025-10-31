import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERRAL_CODE_STORAGE_KEY = 'pending_referral_code';

/**
 * Hook to capture and store referral codes from deep links
 */
export function useReferralLink() {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check for initial URL (when app opens from link)
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const code = extractReferralCode(url);
        if (code) {
          await AsyncStorage.setItem(REFERRAL_CODE_STORAGE_KEY, code);
          setReferralCode(code);
        }
      }
    };

    // Listen for URL events (when app is already open)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const code = extractReferralCode(url);
      if (code) {
        AsyncStorage.setItem(REFERRAL_CODE_STORAGE_KEY, code);
        setReferralCode(code);
      }
    });

    // Check for stored referral code
    AsyncStorage.getItem(REFERRAL_CODE_STORAGE_KEY).then(stored => {
      if (stored) {
        setReferralCode(stored);
      }
    });

    checkInitialUrl();

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Get and clear the stored referral code
   */
  const getAndClearReferralCode = async (): Promise<string | null> => {
    const code = await AsyncStorage.getItem(REFERRAL_CODE_STORAGE_KEY);
    if (code) {
      await AsyncStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
      setReferralCode(null);
    }
    return code;
  };

  return { referralCode, getAndClearReferralCode };
}

/**
 * Extract referral code from URL
 * Supports both https://opendoors.app/download?ref=CODE and opendoors://?ref=CODE
 */
function extractReferralCode(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    const ref = parsed.queryParams?.ref as string;
    if (ref && typeof ref === 'string') {
      return ref;
    }
  } catch (error) {
    console.warn('Error parsing referral URL:', error);
  }
  return null;
}

