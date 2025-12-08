import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERRAL_CODE_STORAGE_KEY = 'pending_referral_code';
const REFERRAL_CODE_SHOWN_KEY = 'referral_code_shown';

/**
 * Hook to capture and store referral codes from deep links
 */
export function useReferralLink() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [shouldShowAlert, setShouldShowAlert] = useState(false);

  useEffect(() => {
    // Check for initial URL (when app opens from link)
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const code = extractReferralCode(url);
        if (code) {
          await AsyncStorage.setItem(REFERRAL_CODE_STORAGE_KEY, code);
          // Mark that we should show the alert since this is from a new deep link
          await AsyncStorage.setItem(REFERRAL_CODE_SHOWN_KEY, 'false');
          setReferralCode(code);
          setShouldShowAlert(true);
        }
      }
    };

    // Listen for URL events (when app is already open)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const code = extractReferralCode(url);
      if (code) {
        AsyncStorage.setItem(REFERRAL_CODE_STORAGE_KEY, code);
        // Mark that we should show the alert since this is from a new deep link
        AsyncStorage.setItem(REFERRAL_CODE_SHOWN_KEY, 'false');
        setReferralCode(code);
        setShouldShowAlert(true);
      }
    });

    // Check for stored referral code (but don't trigger alert)
    AsyncStorage.getItem(REFERRAL_CODE_STORAGE_KEY).then(async stored => {
      if (stored) {
        setReferralCode(stored);
        // Check if we've already shown the alert for this code
        const shown = await AsyncStorage.getItem(REFERRAL_CODE_SHOWN_KEY);
        setShouldShowAlert(shown !== 'true');
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
      await AsyncStorage.removeItem(REFERRAL_CODE_SHOWN_KEY);
      setReferralCode(null);
      setShouldShowAlert(false);
    }
    return code;
  };

  /**
   * Mark that the alert has been shown for the current referral code
   */
  const markAlertShown = async () => {
    await AsyncStorage.setItem(REFERRAL_CODE_SHOWN_KEY, 'true');
    setShouldShowAlert(false);
  };

  return { referralCode, shouldShowAlert, getAndClearReferralCode, markAlertShown };
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

