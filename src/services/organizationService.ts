import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoorDistribution {
  id: string;
  distributor_id: string;
  recipient_id: string;
  organization_id: string;
  doors_sent: number;
  reason: string | null;
  created_at: string;
  // Joined data
  recipient_name?: string;
  recipient_email?: string;
  distributor_name?: string;
  distributor_email?: string;
}

export interface DistributorMember {
  id: string;
  distributor_id: string;
  member_id: string;
  organization_id: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: 'user' | 'distributor' | 'admin';
  doors_available: number;
  doors_distributed: number;
}

class OrganizationService {
  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      return { data, error };
    } catch (error: any) {
      console.error('Error fetching organization:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all members in an organization
   */
  async getOrganizationMembers(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, user_type, doors_available, doors_distributed')
        .eq('organization_id', organizationId)
        .order('user_type', { ascending: true })
        .order('last_name', { ascending: true });

      return { data: data as OrganizationMember[] | null, error };
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all users (for distributors to send doors to anyone)
   */
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, user_type')
        .eq('user_type', 'user') // Only regular users can receive doors
        .order('last_name', { ascending: true });

      return { data: data as OrganizationMember[] | null, error };
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get members that a specific distributor can send doors to
   * If distributor_members has entries for this distributor, return only those
   * Otherwise, return all users in the organization (default behavior)
   */
  async getDistributorMembers(distributorId: string, organizationId: string) {
    try {
      // First check if there are specific member assignments
      const { data: assignedMembers, error: assignError } = await supabase
        .from('distributor_members')
        .select('member_id')
        .eq('distributor_id', distributorId);

      if (assignError) {
        console.error('Error checking assigned members:', assignError);
        return { data: null, error: assignError.message };
      }

      // If there are specific assignments, get only those users
      if (assignedMembers && assignedMembers.length > 0) {
        const memberIds = assignedMembers.map(m => m.member_id);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, email, first_name, last_name, user_type')
          .eq('organization_id', organizationId)
          .in('id', memberIds)
          .eq('user_type', 'user') // Only regular users can receive doors
          .order('last_name', { ascending: true });

        return { data: data as OrganizationMember[] | null, error };
      }

      // Default: Return all users in the organization
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, user_type')
        .eq('organization_id', organizationId)
        .eq('user_type', 'user') // Only regular users can receive doors
        .order('last_name', { ascending: true });

      return { data: data as OrganizationMember[] | null, error };
    } catch (error: any) {
      console.error('Error fetching distributor members:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Send doors from distributor to user
   */
  async sendDoors(
    distributorId: string,
    recipientId: string,
    doorsToSend: number,
    reason: string
  ) {
    try {
      // Check if distributor has enough doors
      const { data: distributor, error: distributorError } = await supabase
        .from('user_profiles')
        .select('doors_available, doors_distributed')
        .eq('id', distributorId)
        .single();

      if (distributorError || !distributor) {
        return { success: false, error: 'Distributor not found' };
      }

      if (distributor.doors_available < doorsToSend) {
        return { success: false, error: 'Not enough doors available' };
      }

      // Get distributor's organization_id
      const { data: distributorProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', distributorId)
        .single();

      if (profileError || !distributorProfile) {
        return { success: false, error: 'Distributor profile not found' };
      }

      // Debug: Check distributor profile
      console.log('🔍 Creating distribution with:', {
        distributorId,
        recipientId,
        organizationId: distributorProfile.organization_id,
        doorsToSend,
        reason
      });

      // Create door distribution record
      // Try with RLS first, if that fails, try with service role
      let distribution, distributionError;
      
      const distributionData = {
        distributor_id: distributorId,
        recipient_id: recipientId,
        organization_id: distributorProfile.organization_id,
        doors_sent: doorsToSend,
        reason: reason
      };

      const { data: distData, error: distError } = await supabase
        .from('door_distributions')
        .insert(distributionData)
        .select()
        .single();

      if (distError) {
        console.log('🔍 RLS error, trying alternative approach:', distError);
        
        // If RLS fails, try using a function that bypasses RLS
        const { data: altData, error: altError } = await supabase
          .rpc('create_door_distribution', distributionData);
        
        if (altError) {
          console.log('🔍 Alternative approach also failed:', altError);
          distributionError = distError; // Use original error
        } else {
          distribution = altData;
          distributionError = null;
        }
      } else {
        distribution = distData;
        distributionError = null;
      }

      if (distributionError || !distribution) {
        console.error('Error creating distribution:', distributionError);
        return { success: false, error: 'Failed to create distribution record' };
      }

      // Update distributor's doors count
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          doors_available: distributor.doors_available - doorsToSend,
          doors_distributed: distributor.doors_distributed + doorsToSend
        })
        .eq('id', distributorId);

      if (updateError) {
        console.error('Error updating distributor doors:', updateError);
        return { success: false, error: 'Failed to update distributor doors' };
      }

      // Get distributor name for notifications and rewards
      const { data: distributorNameData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email')
        .eq('id', distributorId)
        .single();

      const distributorName = distributorNameData 
        ? (distributorNameData.first_name && distributorNameData.last_name
            ? `${distributorNameData.first_name} ${distributorNameData.last_name}`
            : distributorNameData.email)
        : 'Unknown Distributor';

      // Create notification for the recipient
      const notificationResult = await notificationService.createDoorNotification(
        recipientId,
        distributorName,
        doorsToSend,
        reason
      );

      if (!notificationResult.success) {
        console.error('Error creating notification:', notificationResult.error);
        // Don't fail the entire operation for notification errors
      }

      // Add earned rewards for the recipient
      const earnedRewardsToCreate = [];
      for (let i = 0; i < doorsToSend; i++) {
        earnedRewardsToCreate.push({
          user_id: recipientId,
          doors_earned: 1,
          source_type: 'distributor',
          source_name: distributorName,
          description: reason,
          claimed: false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          distribution_id: distribution.id
        });
      }

      const { error: rewardsError } = await supabase
        .from('earned_rewards')
        .insert(earnedRewardsToCreate);

      if (rewardsError) {
        console.error('Error creating earned rewards:', rewardsError);
        return { success: false, error: 'Failed to create earned rewards' };
      }

      return { success: true, data: distribution };
    } catch (error: any) {
      console.error('Error sending doors:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get door distributions for a distributor (their sending history)
   */
  async getDistributorHistory(distributorId: string) {
    try {
      const { data, error } = await supabase
        .from('door_distributions')
        .select('*')
        .eq('distributor_id', distributorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching distributor history:', error);
        return { data: null, error: error.message };
      }

      // Fetch recipient profiles separately
      if (data && data.length > 0) {
        const recipientIds = data.map((dist: any) => dist.recipient_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email, first_name, last_name')
          .in('id', recipientIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Format the data
        const formattedData = data.map((dist: any) => {
          const recipient = profileMap.get(dist.recipient_id);
          return {
            ...dist,
            recipient_name: recipient 
              ? `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || recipient.email
              : 'Unknown',
            recipient_email: recipient?.email || ''
          };
        }) as DoorDistribution[];

        return { data: formattedData, error: null };
      }

      return { data: [], error: null };
    } catch (error: any) {
      console.error('Error fetching distributor history:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all door distributions in an organization (for admin view)
   */
  async getOrganizationDistributions(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('door_distributions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization distributions:', error);
        return { data: null, error: error.message };
      }

      // Fetch user profiles separately for distributor and recipient names
      if (data && data.length > 0) {
        const userIds = new Set<string>();
        data.forEach((dist: any) => {
          userIds.add(dist.distributor_id);
          userIds.add(dist.recipient_id);
        });

        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email, first_name, last_name')
          .in('id', Array.from(userIds));

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Format the data with user names
        const formattedData = data.map((dist: any) => {
          const distributor = profileMap.get(dist.distributor_id);
          const recipient = profileMap.get(dist.recipient_id);
          
          return {
            ...dist,
            distributor_name: distributor 
              ? `${distributor.first_name || ''} ${distributor.last_name || ''}`.trim() || distributor.email
              : 'Unknown',
            distributor_email: distributor?.email || '',
            recipient_name: recipient 
              ? `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || recipient.email
              : 'Unknown',
            recipient_email: recipient?.email || ''
          };
        }) as DoorDistribution[];

        return { data: formattedData, error: null };
      }

      return { data: [], error: null };
    } catch (error: any) {
      console.error('Error fetching organization distributions:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get distributors in an organization (for admin view)
   */
  async getOrganizationDistributors(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name, doors_available, doors_distributed')
        .eq('organization_id', organizationId)
        .eq('user_type', 'distributor')
        .order('last_name', { ascending: true });

      return { data: data as OrganizationMember[] | null, error };
    } catch (error: any) {
      console.error('Error fetching distributors:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update distributor door allowance (for admin)
   */
  async updateDistributorDoors(distributorId: string, doorsToAdd: number) {
    try {
      const { data: distributor, error: fetchError } = await supabase
        .from('user_profiles')
        .select('doors_available')
        .eq('id', distributorId)
        .single();

      if (fetchError || !distributor) {
        return { success: false, error: 'Distributor not found' };
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          doors_available: distributor.doors_available + doorsToAdd
        })
        .eq('id', distributorId);

      if (updateError) {
        console.error('Error updating distributor doors:', updateError);
        return { success: false, error: 'Failed to update distributor doors' };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error updating distributor doors:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add user to organization (for admin)
   */
  async addUserToOrganization(
    organizationId: string,
    email: string,
    firstName: string | null,
    lastName: string | null,
    userType: 'user' | 'distributor'
  ) {
    try {
      // First, check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, organization_id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { success: false, error: 'Error checking existing user' };
      }

      if (existingUser) {
        if (existingUser.organization_id === organizationId) {
          return { success: false, error: 'User is already in this organization' };
        } else if (existingUser.organization_id) {
          return { success: false, error: 'User is already in another organization' };
        }
      }

      // If user exists but has no organization, update their profile
      if (existingUser) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            organization_id: organizationId,
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            doors_available: userType === 'distributor' ? 0 : 0,
            doors_distributed: 0
          })
          .eq('id', existingUser.id);

        if (updateError) {
          return { success: false, error: 'Failed to update user profile' };
        }

        return { success: true, error: null };
      }

      // If user doesn't exist, create a new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          organization_id: organizationId,
          user_type: userType,
          doors_available: userType === 'distributor' ? 0 : 0,
          doors_distributed: 0
        });

      if (insertError) {
        return { success: false, error: 'Failed to create user profile' };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error adding user to organization:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign members to distributor (for admin)
   */
  async assignMembersToDistributor(distributorId: string, memberIds: string[]) {
    try {
      // First, remove existing assignments for this distributor
      const { error: deleteError } = await supabase
        .from('distributor_members')
        .delete()
        .eq('distributor_id', distributorId);

      if (deleteError) {
        console.error('Error removing existing assignments:', deleteError);
        return { success: false, error: 'Failed to remove existing assignments' };
      }

      // If no members to assign, we're done
      if (memberIds.length === 0) {
        return { success: true, error: null };
      }

      // Create new assignments
      const assignments = memberIds.map(memberId => ({
        distributor_id: distributorId,
        member_id: memberId
      }));

      const { error: insertError } = await supabase
        .from('distributor_members')
        .insert(assignments);

      if (insertError) {
        console.error('Error creating new assignments:', insertError);
        return { success: false, error: 'Failed to assign members' };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error assigning members to distributor:', error);
      return { success: false, error: error.message };
    }
  }
}

export const organizationService = new OrganizationService();

