import { supabase } from '../services/supabase/client';

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
  created_at?: string;
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
  expires_at: string;
}

class RewardsService {
  // Get icon and background color for different companies
  private getIconAndColor(locationName: string): { icon: string; bgColor: string } {
    const name = locationName.toLowerCase();
    
    if (name.includes('chick')) return { icon: '🐔', bgColor: 'bg-orange-50' };
    if (name.includes('starbucks')) return { icon: '☕', bgColor: 'bg-green-50' };
    if (name.includes('mcdonald')) return { icon: '🍟', bgColor: 'bg-yellow-50' };
    if (name.includes('target')) return { icon: '🎯', bgColor: 'bg-red-50' };
    if (name.includes('fruit') || name.includes('veggie')) return { icon: '🌽', bgColor: 'bg-green-50' };
    if (name.includes('coffee')) return { icon: '☕', bgColor: 'bg-orange-50' };
    if (name.includes('sandwich')) return { icon: '🥪', bgColor: 'bg-yellow-50' };
    if (name.includes('burger')) return { icon: '🍔', bgColor: 'bg-red-50' };
    if (name.includes('pizza')) return { icon: '🍕', bgColor: 'bg-orange-50' };
    if (name.includes('ice cream')) return { icon: '🍦', bgColor: 'bg-blue-50' };
    if (name.includes('donut')) return { icon: '🍩', bgColor: 'bg-pink-50' };
    if (name.includes('cookie')) return { icon: '🍪', bgColor: 'bg-yellow-50' };
    if (name.includes('cake')) return { icon: '🍰', bgColor: 'bg-pink-50' };
    if (name.includes('candy')) return { icon: '🍬', bgColor: 'bg-purple-50' };
    if (name.includes('chocolate')) return { icon: '🍫', bgColor: 'bg-brown-50' };
    if (name.includes('gift card')) return { icon: '💳', bgColor: 'bg-blue-50' };
    if (name.includes('discount')) return { icon: '💰', bgColor: 'bg-green-50' };
    if (name.includes('free')) return { icon: '🎁', bgColor: 'bg-purple-50' };
    
    // Default
    return { icon: '🎁', bgColor: 'bg-blue-50' };
  }

  // Generate QR code for reward
  private generateQRCode(prizeId: string, userId: string): string {
    return `REWARD_${prizeId.substring(0, 8).toUpperCase()}_${userId.substring(0, 4)}`;
  }

  // Generate redemption instructions
  private generateInstructions(locationName: string, description: string, prizeType?: string, redemptionMethod?: string): string[] {
    const name = locationName.toLowerCase();
    
    // If we have a specific redemption method, use that
    if (redemptionMethod) {
      switch (redemptionMethod) {
        case 'qr':
          return [
            'Show QR code to staff',
            'Valid during store hours',
            'Cannot be redeemed for cash',
            'Valid at participating locations'
          ];
        case 'code':
          return [
            'Enter code at checkout',
            'Valid for one-time use',
            'Cannot be combined with other offers',
            'Valid at participating locations'
          ];
        case 'email':
          return [
            'Check your email for redemption details',
            'Follow the instructions in the email',
            'Valid for one-time use',
            'Contact support if you need help'
          ];
        case 'pickup':
          return [
            'Visit the location during business hours',
            'Show your ID and reward details',
            'Valid for one-time use',
            'Cannot be redeemed for cash'
          ];
      }
    }
    
    // If we have a specific prize type, use that
    if (prizeType) {
      switch (prizeType) {
        case 'digital':
          return [
            'Check your email for redemption details',
            'Follow the instructions in the email',
            'Valid for one-time use',
            'Contact support if you need help'
          ];
        case 'physical':
          return [
            'Visit the location during business hours',
            'Show your ID and reward details',
            'Valid for one-time use',
            'Cannot be redeemed for cash'
          ];
        case 'discount':
          return [
            'Show code at checkout',
            'Valid for one-time use',
            'Cannot be combined with other offers',
            'Valid at participating locations'
          ];
      }
    }
    
    // Fall back to location-based instructions
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
      console.log('🎁 Fetching rewards for user:', userId);
      
      // Get user's claimed rewards (join with prizes table)
      const { data: userRewards, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select(`
          prize_id,
          claimed_at,
          qr_code,
          expires_at,
          created_at,
          prizes (
            id,
            name,
            description,
            value,
            location_name,
            address,
            expires_at,
            prize_type,
            redemption_method
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true }); // Sort by oldest first

      if (userRewardsError) {
        console.error('Error fetching user rewards:', userRewardsError);
        return { data: null, error: userRewardsError.message };
      }

      console.log('🎁 Raw user rewards from database:', JSON.stringify(userRewards, null, 2));

      if (!userRewards || userRewards.length === 0) {
        console.log('🎁 No rewards found for user');
        return { data: [], error: null };
      }

      // Transform the data to match our UserReward interface
      const rewards: UserReward[] = (userRewards || [])
        .map((userReward: any): UserReward | null => {
          console.log('🎁 Processing reward:', JSON.stringify(userReward, null, 2));
          
          const prize = userReward.prizes;
          if (!prize) {
            console.error('🎁 Missing prize data for reward:', userReward);
            return null;
          }

          const { icon, bgColor } = this.getIconAndColor(prize.location_name || prize.name);
          
          const transformedReward: UserReward = {
            id: prize.id,
            company: (prize.location_name || prize.name).replace(/\s*\([^)]*\)/, ''), // Remove location details like "(Downtown)"
            reward: prize.description || prize.name,
            claimed: !!userReward.claimed_at,
            expirationDate: userReward.expires_at || prize.expires_at || this.getExpirationDate(),
            icon,
            bgColor,
            qrCode: userReward.qr_code,
            instructions: this.generateInstructions(prize.location_name || prize.name, prize.description || prize.name, prize.prize_type, prize.redemption_method),
            value: prize.value,
            address: prize.address,
            locationName: prize.location_name || prize.name,
            created_at: userReward.created_at
          };

          console.log('🎁 Transformed reward:', JSON.stringify(transformedReward, null, 2));
          return transformedReward;
        })
        .filter((reward): reward is UserReward => reward !== null); // Type guard to remove nulls

      console.log('🎁 Final transformed rewards:', JSON.stringify(rewards, null, 2));
      return { data: rewards, error: null };

    } catch (error) {
      console.error('Error in getUserRewards:', error);
      return { data: null, error: 'Failed to fetch rewards' };
    }
  }

  // Add a new reward when user wins a game
  async addUserReward(userId: string, prizeId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No authenticated session found');
        return { success: false, error: 'No authenticated session found' };
      }

      console.log('🎁 Adding user reward:', {
        userId: session.user.id,
        prizeId,
        sessionExists: !!session
      });

      const qrCode = this.generateQRCode(prizeId, session.user.id);
      
      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { data, error } = await supabase
        .from('user_rewards')
        .insert({
          user_id: session.user.id,
          prize_id: prizeId,
          qr_code: qrCode,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding user reward:', error);
        return { success: false, error: error.message };
      }

      console.log('🎁 Successfully added reward:', data);
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
