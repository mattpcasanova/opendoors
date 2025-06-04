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
      games: {
        Row: {
          id: string
          user_id: string
          chosen_door: number
          winning_door: number
          switched: boolean
          won: boolean
          prize_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chosen_door: number
          winning_door: number
          switched: boolean
          won: boolean
          prize_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chosen_door?: number
          winning_door?: number
          switched?: boolean
          won?: boolean
          prize_id?: string | null
          created_at?: string
        }
      }
      prizes: {
        Row: {
          id: string
          name: string
          description: string
          sponsor: string
          value: number
          image_url: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          sponsor: string
          value: number
          image_url: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          sponsor?: string
          value?: number
          image_url?: string
          active?: boolean
        }
      }
    }
  }
} 