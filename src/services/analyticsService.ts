// Simple analytics service that tracks events to Supabase
// Tracks key user actions for understanding app usage and retention

import { supabase } from './supabase/client';

export interface AnalyticsEvent {
  user_id: string;
  event_name: string;
  event_data?: Record<string, any>;
  created_at?: string;
}

class AnalyticsService {
  /**
   * Track an analytics event
   */
  async trackEvent(
    userId: string,
    eventName: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_name: eventName,
          event_data: eventData || {},
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      // Don't throw - analytics failures shouldn't break the app
      console.error('Analytics error:', error);
    }
  }

  /**
   * Track user signup
   */
  async trackSignup(userId: string, metadata?: {
    hasReferralCode?: boolean;
    signupMethod?: string;
  }): Promise<void> {
    await this.trackEvent(userId, 'user_signup', metadata);
  }

  /**
   * Track first game played
   */
  async trackFirstGame(userId: string, metadata?: {
    prizeName?: string;
    prizeCategory?: string;
  }): Promise<void> {
    await this.trackEvent(userId, 'first_game_played', metadata);
  }

  /**
   * Track first win
   */
  async trackFirstWin(userId: string, metadata?: {
    prizeName?: string;
    prizeValue?: string;
  }): Promise<void> {
    await this.trackEvent(userId, 'first_win', metadata);
  }

  /**
   * Track referral shared
   */
  async trackReferralShared(userId: string, metadata?: {
    shareMethod?: string; // 'copy' or 'share'
  }): Promise<void> {
    await this.trackEvent(userId, 'referral_shared', metadata);
  }

  /**
   * Track daily return (user opens app on a different day)
   */
  async trackDailyReturn(userId: string, metadata?: {
    daysSinceLastVisit?: number;
  }): Promise<void> {
    await this.trackEvent(userId, 'daily_return', metadata);
  }

  /**
   * Track any game played (not just first)
   */
  async trackGamePlayed(userId: string, metadata?: {
    prizeName?: string;
    prizeCategory?: string;
    won?: boolean;
  }): Promise<void> {
    await this.trackEvent(userId, 'game_played', metadata);
  }

  /**
   * Track ad watched
   */
  async trackAdWatched(userId: string, metadata?: {
    completed?: boolean;
    doorsEarned?: number;
  }): Promise<void> {
    await this.trackEvent(userId, 'ad_watched', metadata);
  }
}

export const analyticsService = new AnalyticsService();
