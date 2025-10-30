import Constants from 'expo-constants';
import { Platform } from 'react-native';

type RewardResult = {
  userEarnedReward: boolean;
};

class AdsService {
  private rewardedAd: any | null = null;
  private isInitialized = false;

  private getIsProd(): boolean {
    // Heuristic for prod builds; adjust as needed
    const channel = (Constants as any)?.expoConfig?.extra?.releaseChannel || (Constants as any)?.manifest?.releaseChannel;
    return !!channel && channel !== 'default';
  }

  private getRewardedUnitId(): string {
    // Google test IDs
    const TEST_IOS = 'ca-app-pub-3940256099942544/1712485313';
    const TEST_ANDROID = 'ca-app-pub-3940256099942544/5224354917';

    const prodIds = (Constants as any)?.expoConfig?.extra?.admob?.rewardedUnitIds || {};
    const platform = Platform.OS;

    if (this.getIsProd()) {
      return platform === 'ios' ? (prodIds.ios || TEST_IOS) : (prodIds.android || TEST_ANDROID);
    }
    return platform === 'ios' ? TEST_IOS : TEST_ANDROID;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // Lazy require to avoid TS resolution until package is installed
      const mobileAds = require('react-native-google-mobile-ads');
      console.log('[ads] Initializing Google Mobile Ads');
      await mobileAds.default().initialize();
      try {
        await mobileAds.default().setRequestConfiguration({
          testDeviceIdentifiers: ['SIMULATOR'],
        });
      } catch {}
      console.log('[ads] Initialized');
      this.isInitialized = true;
    } catch (e) {
      console.warn('[ads] Init failed or library not installed:', e);
    }
  }

  async showRewardedAd(): Promise<RewardResult> {
    try {
      const mobileAds = require('react-native-google-mobile-ads');
      const { RewardedAd, AdEventType, RewardedAdEventType } = mobileAds;

      const adUnitId = this.getRewardedUnitId();
      console.log('[ads] Loading rewarded ad with unit id:', adUnitId);
      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      let earned = false;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('[ads] Load/show timeout (15s)');
          resolve();
        }, 15000);

        const unError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
          clearTimeout(timeout);
          console.warn('[ads] Event error:', error);
          try { unError(); unLoaded(); unClosed(); unEarned(); } catch {}
          reject(error);
        });
        const unLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          clearTimeout(timeout);
          console.log('[ads] Showing rewarded ad');
          rewarded.show();
        });
        const unEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        });
        const unClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          clearTimeout(timeout);
          try { unError(); unLoaded(); unClosed(); unEarned(); } catch {}
          resolve();
        });

        rewarded.load();
      });

      return { userEarnedReward: earned };
    } catch (e) {
      console.warn('[ads] Rewarded ad failed or not available:', e);
      return { userEarnedReward: false };
    }
  }
}

export const adsService = new AdsService();


