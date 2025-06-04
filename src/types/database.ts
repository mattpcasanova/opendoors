export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sponsors: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          brand_color: string | null
          website_url: string | null
          contact_email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          brand_color?: string | null
          website_url?: string | null
          contact_email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          brand_color?: string | null
          website_url?: string | null
          contact_email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      prizes: {
        Row: {
          id: string
          sponsor_id: string
          name: string
          description: string | null
          value: number | null
          image_url: string | null
          terms_conditions: string | null
          prize_type: 'digital' | 'physical' | 'discount'
          redemption_method: 'code' | 'qr' | 'email' | 'pickup'
          stock_quantity: number | null
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          name: string
          description?: string | null
          value?: number | null
          image_url?: string | null
          terms_conditions?: string | null
          prize_type: 'digital' | 'physical' | 'discount'
          redemption_method: 'code' | 'qr' | 'email' | 'pickup'
          stock_quantity?: number | null
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sponsor_id?: string
          name?: string
          description?: string | null
          value?: number | null
          image_url?: string | null
          terms_conditions?: string | null
          prize_type?: 'digital' | 'physical' | 'discount'
          redemption_method?: 'code' | 'qr' | 'email' | 'pickup'
          stock_quantity?: number | null
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          avatar_url: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          user_id: string
          prize_id: string
          chosen_door: number
          winning_door: number
          revealed_door: number
          switched: boolean
          won: boolean
          game_duration_seconds: number | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prize_id: string
          chosen_door: number
          winning_door: number
          revealed_door: number
          switched: boolean
          won: boolean
          game_duration_seconds?: number | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prize_id?: string
          chosen_door?: number
          winning_door?: number
          revealed_door?: number
          switched?: boolean
          won?: boolean
          game_duration_seconds?: number | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      user_prizes: {
        Row: {
          id: string
          user_id: string
          game_id: string
          prize_id: string
          redemption_code: string | null
          redemption_status: 'pending' | 'redeemed' | 'expired' | 'cancelled'
          redeemed_at: string | null
          expires_at: string | null
          fulfillment_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          prize_id: string
          redemption_code?: string | null
          redemption_status?: 'pending' | 'redeemed' | 'expired' | 'cancelled'
          redeemed_at?: string | null
          expires_at?: string | null
          fulfillment_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          prize_id?: string
          redemption_code?: string | null
          redemption_status?: 'pending' | 'redeemed' | 'expired' | 'cancelled'
          redeemed_at?: string | null
          expires_at?: string | null
          fulfillment_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_plays: {
        Row: {
          id: string
          user_id: string
          play_date: string
          free_plays_used: number
          premium_plays_used: number
          bonus_plays_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          play_date: string
          free_plays_used?: number
          premium_plays_used?: number
          bonus_plays_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          play_date?: string
          free_plays_used?: number
          premium_plays_used?: number
          bonus_plays_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_games: number
          games_won: number
          games_switched: number
          switch_wins: number
          stay_wins: number
          total_prize_value: number
          current_streak: number
          longest_streak: number
          favorite_sponsor_id: string | null
          last_game_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_games?: number
          games_won?: number
          games_switched?: number
          switch_wins?: number
          stay_wins?: number
          total_prize_value?: number
          current_streak?: number
          longest_streak?: number
          favorite_sponsor_id?: string | null
          last_game_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_games?: number
          games_won?: number
          games_switched?: number
          switch_wins?: number
          stay_wins?: number
          total_prize_value?: number
          current_streak?: number
          longest_streak?: number
          favorite_sponsor_id?: string | null
          last_game_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'monthly' | 'yearly' | 'lifetime'
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'monthly' | 'yearly' | 'lifetime'
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'monthly' | 'yearly' | 'lifetime'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_game_stats: {
        Row: {
          user_id: string
          total_games: number
          games_won: number
          games_switched: number
          switch_wins: number
          stay_wins: number
          win_percentage: number
          switch_win_percentage: number
          stay_win_percentage: number
        }
      }
      active_prizes_with_sponsors: {
        Row: {
          id: string
          sponsor_id: string
          name: string
          description: string | null
          value: number | null
          image_url: string | null
          terms_conditions: string | null
          prize_type: 'digital' | 'physical' | 'discount'
          redemption_method: 'code' | 'qr' | 'email' | 'pickup'
          stock_quantity: number | null
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
          sponsor_name: string
          sponsor_logo: string | null
          sponsor_color: string | null
        }
      }
      recent_games_with_details: {
        Row: {
          id: string
          user_id: string
          prize_id: string
          chosen_door: number
          winning_door: number
          revealed_door: number
          switched: boolean
          won: boolean
          game_duration_seconds: number | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          prize_name: string
          prize_value: number | null
          sponsor_name: string
          sponsor_logo: string | null
          redemption_code: string | null
          redemption_status: 'pending' | 'redeemed' | 'expired' | 'cancelled'
        }
      }
    }
  }
} 