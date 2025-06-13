import { supabase } from '../lib/supabase';

export interface UserReward {
  id: string;
  company: string;
  reward: string;
  claimed: boolean;
  expirationDate: string;
  icon: string;
  bgColor: string;
  qrCode: string;
  instructions: string[];
  value?: number;
  address?: string;
  locationName?: string;
}

// Interface for the database prize
interface PrizeRow {
  id: string;
  name: string;
  description: string;
  value: number;
  location_name: string;
  address: string;
  created_at: string;
  expires_at: string | null;
}

// Interface for user claimed rewards
interface UserClaimedReward {
  user_id: string;
  prize_id: string;
  claimed_at: string;
  qr_code: string;
}

class RewardsService {
  // Get icon and background color for different companies
  private getIconAndColor(locationName: string): { icon: string; bgColor: string } {
    const name = locationName.toLowerCase();
    
    if (name.includes('chick')) return { icon: '🐔', bgColor: 'bg-orange-50' };
    if (name.includes('starbucks')) return { icon: '☕', bgColor: 'bg-green-50' };
    if (name.includes('mcdonald')) return { icon: '🍟', bgColor: 'bg-yellow-50' };
    if (name.includes('target')) return { icon: '🎯', bgColor: 'bg-red-50' };
    
    // Default
    return { icon: '🎁', bgColor: 'bg-blue-50' };
  }

  // Generate QR code for reward
  private generateQRCode(prizeId: string, userId: string): string {
    return `REWARD_${prizeId.substring(0, 8).toUpperCase()}_${userId.substring(0, 4)}`;
  }

  // Generate redemption instructions
  private generateInstructions(locationName: string, description: string): string[] {
    const name = locationName.toLowerCase();
    
    if (name.includes('chick')) {
      return [
        'Present QR code to cashier',
        'Valid for any sandwich on menu',
        'One per customer per visit',
        'Valid at participating locations'
      ];
    }
    
    if (name.includes('starbucks')) {
      return [
        'Present QR code when ordering',
        'Valid on all beverages',
        'Cannot upgrade food items',
        'Valid at participating locations'
      ];
    }
    
    if (name.includes('target')) {
      return [
        'Show this QR code at checkout',
        'Valid for any purchase',
        'Cannot be combined with other offers',
        'Valid at all Target locations'
      ];
    }
    
    // Default instructions
    return [
      'Show QR code to staff',
      'Valid during store hours',
      'Cannot be redeemed for cash',
      'Valid at participating locations'
    ];
  }

  // Calculate expiration date (30 days from now for rewards)
  private getExpirationDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  // Get user's claimed rewards from prizes they've won
  async getUserRewards(userId: string): Promise<{ data: UserReward[] | null; error: string | null }> {
    try {
      // Get user's claimed rewards (join with prizes table)
      const { data: userRewards, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select(`
          prize_id,
          claimed_at,
          qr_code,
          prizes (
            id,
            name,
            description,
            value,
            location_name,
            address,
            expires_at
          )
        `)
        .eq('user_id', userId);

      if (userRewardsError) {
        console.error('Error fetching user rewards:', userRewardsError);
        return { data: null, error: userRewardsError.message };
      }

      // Transform the data to match our UserReward interface
      const rewards: UserReward[] = (userRewards || []).map((userReward: any) => {
        const prize = userReward.prizes;
        const { icon, bgColor } = this.getIconAndColor(prize.location_name);
        
        return {
          id: prize.id,
          company: prize.location_name.replace(/\s*\([^)]*\)/, ''), // Remove location details like "(Downtown)"
          reward: prize.description,
          claimed: true, // All rewards from user_rewards table are claimed
          expirationDate: prize.expires_at || this.getExpirationDate(),
          icon,
          bgColor,
          qrCode: userReward.qr_code,
          instructions: this.generateInstructions(prize.location_name, prize.description),
          value: prize.value,
          address: prize.address,
          locationName: prize.location_name,
        };
      });

      return { data: rewards, error: null };

    } catch (error) {
      console.error('Error in getUserRewards:', error);
      return { data: null, error: 'Failed to fetch rewards' };
    }
  }

  // Add a new reward when user wins a game
  async addUserReward(userId: string, prizeId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const qrCode = this.generateQRCode(prizeId, userId);
      
      const { error } = await supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          prize_id: prizeId,
          qr_code: qrCode
        });

      if (error) {
        console.error('Error adding user reward:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };

    } catch (error) {
      console.error('Error in addUserReward:', error);
      return { success: false, error: 'Failed to add reward' };
    }
  }

  // Get all available prizes (for displaying what can be won)
  async getAvailablePrizes(): Promise<{ data: UserReward[] | null; error: string | null }> {
    try {
      const { data: prizes, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching available prizes:', error);
        return { data: null, error: error.message };
      }

      // Transform prizes to rewards format (these would be unclaimed)
      const rewards: UserReward[] = (prizes || []).map((prize: any) => {
        const { icon, bgColor } = this.getIconAndColor(prize.location_name);
        
        return {
          id: prize.id,
          company: prize.location_name.replace(/\s*\([^)]*\)/, ''),
          reward: prize.description,
          claimed: false, // These are available to win, not claimed yet
          expirationDate: prize.expires_at || this.getExpirationDate(),
          icon,
          bgColor,
          qrCode: '', // No QR code until claimed
          instructions: this.generateInstructions(prize.location_name, prize.description),
          value: prize.value,
          address: prize.address,
          locationName: prize.location_name,
        };
      });

      return { data: rewards, error: null };

    } catch (error) {
      console.error('Error in getAvailablePrizes:', error);
      return { data: null, error: 'Failed to fetch available prizes' };
    }
  }
}

export const rewardsService = new RewardsService();
