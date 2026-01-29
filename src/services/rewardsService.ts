import { supabase } from '../services/supabase/client';

export interface UserReward {
  id: string; // unique row id
  user_id?: string;
  prize_id?: string;
  prize_code_id?: string; // ID of the assigned gift certificate code (if using code pool)
  company: string;
  reward: string;
  claimed: boolean;
  expirationDate: string;
  icon: string;
  bgColor: string;
  qrCode: string;
  rewardCode: string;
  logo_url?: string;
  instructions: string[];
  value?: number;
  address?: string;
  locationName?: string;
  created_at?: string;
  hasGiftCertificate?: boolean; // True if this reward uses a real gift certificate code
  // Physical pickup fields
  redemption_method?: 'code' | 'qr' | 'email' | 'pickup';
  pickup_instructions?: string;
  pickup_contact?: string;
  collected_at?: string; // When user physically collected the reward
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
      // First get user rewards
      const { data: userRewards, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select(`
          id,
          user_id,
          prize_id,
          prize_code_id,
          claimed_at,
          collected_at,
          qr_code,
          reward_code,
          logo_url,
          expires_at,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (userRewardsError) {
        return { data: null, error: userRewardsError.message };
      }
      if (!userRewards || userRewards.length === 0) {
        return { data: [], error: null };
      }

      // Then get prizes for all prize_ids
      const prizeIds = userRewards.map(ur => ur.prize_id);
      const { data: prizes, error: prizesError } = await supabase
        .from('prizes')
        .select(`
          id,
          name,
          description,
          value,
          location_name,
          address,
          expires_at,
          prize_type,
          redemption_method,
          logo_url,
          pickup_instructions,
          pickup_contact
        `)
        .in('id', prizeIds);

      if (prizesError) {
        return { data: null, error: prizesError.message };
      }

      // Create a map of prizes by id for quick lookup
      const prizesMap = new Map(prizes?.map(prize => [prize.id, prize]) || []);

      const rewards: UserReward[] = userRewards
        .map((userReward: any): UserReward | null => {
          const prize = prizesMap.get(userReward.prize_id);
          if (!prize) return null;
          const { icon, bgColor } = this.getIconAndColor(prize.location_name || prize.name);
          const hasGiftCertificate = !!userReward.prize_code_id;
          const isPickupReward = prize.redemption_method === 'pickup';
          return {
            id: userReward.id,
            user_id: userReward.user_id,
            prize_id: userReward.prize_id,
            prize_code_id: userReward.prize_code_id,
            company: (prize.location_name || prize.name).replace(/\s*\([^)]*\)/, ''),
            reward: prize.description || prize.name,
            claimed: !!userReward.claimed_at,
            expirationDate: userReward.expires_at || prize.expires_at || this.getExpirationDate(),
            icon,
            bgColor,
            qrCode: userReward.qr_code,
            rewardCode: userReward.reward_code,
            logo_url: userReward.logo_url || prize.logo_url,
            instructions: hasGiftCertificate
              ? [
                  'Show QR code to cashier',
                  'Cashier scans to reveal redemption code',
                  'Code is entered into register',
                  'Valid for one-time use only'
                ]
              : this.generateInstructions(prize.location_name || prize.name, prize.description || prize.name, prize.prize_type, prize.redemption_method),
            value: prize.value,
            address: prize.address,
            locationName: prize.location_name || prize.name,
            created_at: userReward.created_at,
            hasGiftCertificate,
            // Physical pickup fields
            redemption_method: prize.redemption_method,
            pickup_instructions: isPickupReward ? prize.pickup_instructions : undefined,
            pickup_contact: isPickupReward ? prize.pickup_contact : undefined,
            collected_at: userReward.collected_at
          };
        })
        .filter((reward): reward is UserReward => reward !== null);
      return { data: rewards, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch rewards' };
    }
  }

  // Add a new reward when user wins a game
  async addUserReward(userId: string, prizeId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'No authenticated session found' };
      }
      // Fetch prize to get logo_url
      const { data: prize } = await supabase.from('prizes').select('logo_url').eq('id', prizeId).single();
      const qrCode = this.generateQRCode(prizeId, session.user.id);
      const rewardCode = `RCODE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const { data, error } = await supabase
        .from('user_rewards')
        .insert({
          user_id: session.user.id,
          prize_id: prizeId,
          qr_code: qrCode,
          reward_code: rewardCode,
          logo_url: prize?.logo_url || null,
          expires_at: expiresAt.toISOString().split('T')[0]
        })
        .select()
        .single();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (error) {
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
        return { data: null, error: error.message };
      }

      // Transform prizes to rewards format (these would be unclaimed)
      const rewards: UserReward[] = (prizes || []).map((prize: any) => {
        const { icon, bgColor } = this.getIconAndColor(prize.location_name);
        return {
          id: prize.id,
          user_id: '',
          prize_id: prize.id,
          company: prize.location_name.replace(/\s*\([^)]*\)/, ''),
          reward: prize.description,
          claimed: false, // These are available to win, not claimed yet
          expirationDate: prize.expires_at || this.getExpirationDate(),
          icon,
          bgColor,
          qrCode: '', // No QR code until claimed
          rewardCode: '', // No reward code until claimed
          logo_url: prize.logo_url || '',
          instructions: this.generateInstructions(prize.location_name, prize.description),
          value: prize.value,
          address: prize.address,
          locationName: prize.location_name,
          created_at: prize.created_at
        };
      });

      return { data: rewards, error: null };

    } catch (error) {
      return { data: null, error: 'Failed to fetch available prizes' };
    }
  }

  // Add claimRewardById to mark only the specific reward as claimed
  async claimRewardById(rewardId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // First get the reward to check if it has a prize_code_id
      const { data: reward, error: fetchError } = await supabase
        .from('user_rewards')
        .select('id, prize_code_id')
        .eq('id', rewardId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Update user_rewards claimed_at
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({ claimed_at: new Date().toISOString() })
        .eq('id', rewardId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // If there's a prize_code_id, also update the prize_codes table
      // (This is a fallback - normally the Edge Function handles this when QR is scanned)
      if (reward?.prize_code_id) {
        await supabase
          .from('prize_codes')
          .update({
            status: 'claimed',
            claimed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', reward.prize_code_id);
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to claim reward' };
    }
  }

  // Mark reward as collected (for physical pickup rewards)
  async collectRewardById(rewardId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({ collected_at: new Date().toISOString() })
        .eq('id', rewardId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to mark as collected' };
    }
  }

  // Get the status of a prize code
  async getPrizeCodeStatus(prizeCodeId: string): Promise<{ status: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('prize_codes')
        .select('status')
        .eq('id', prizeCodeId)
        .single();

      if (error) {
        return { status: null, error: error.message };
      }

      return { status: data?.status || null, error: null };
    } catch (error) {
      return { status: null, error: 'Failed to fetch prize code status' };
    }
  }
}

export const rewardsService = new RewardsService();
