import { supabase } from '@/lib/supabase';
import { CoreLink, UserProfile } from '@/types/database';

export interface CreateLinkData {
  to_user_id: string;
  title: string;
  description?: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  urgency: number;
}

export const LinksService = {
  async getHouseMembers(houseId: string): Promise<UserProfile[]> {
    try {
      // Get current user to exclude them from the list
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      if (!currentUserId) {
        console.warn('⚠️ No user authenticated, cannot load house members');
        return [];
      }

      console.log('🏠 Fetching members for house:', houseId);
      console.log('👤 Current user ID:', currentUserId);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, zone')
        .eq('house_id', houseId);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        return [];
      }

      console.log('✅ Fetched profiles:', profilesData?.length || 0);

      if (!profilesData || profilesData.length === 0) {
        console.warn('⚠️ No members found for house:', houseId);
        return [];
      }

      // Filter out current user
      const otherMembers = profilesData.filter((p: any) => p.id !== currentUserId);
      const userIds = otherMembers.map((p: any) => p.id);

      console.log('👥 Other members count:', otherMembers.length);

      if (userIds.length === 0) {
        console.log('⚠️ No other members in house after filtering');
        return [];
      }

      // Try to fetch additional details from users_profile table
      let userProfiles = null;
      const { data: userProfilesData, error: upError } = await supabase
        .from('users_profile')
        .select('id, full_name, phone_number, business_category, city')
        .in('id', userIds);

      if (!upError && userProfilesData) {
        userProfiles = userProfilesData;
        console.log('📝 Additional profiles loaded:', userProfiles.length);
      } else if (upError) {
        console.warn('⚠️ Could not load from users_profile, using profiles table data');
      }

      // Create a map of users_profile data
      const profileMap = new Map((userProfiles || []).map((p: any) => [p.id, p]));

      // Merge data from both tables
      const mergedProfiles = otherMembers.map((profile: any) => {
        const userProfile = profileMap.get(profile.id);
        return {
          id: profile.id,
          full_name: userProfile?.full_name || profile.full_name || 'Unknown',
          phone_number: userProfile?.phone_number || null,
          business_category: userProfile?.business_category || '',
          city: userProfile?.city || profile.zone || '',
        };
      });

      // Sort by full_name
      const sortedProfiles = mergedProfiles.sort((a, b) => 
        (a.full_name || '').localeCompare(b.full_name || '')
      );

      console.log(`✅ Loaded ${sortedProfiles.length} members for house ${houseId}`);
      return sortedProfiles;
    } catch (error) {
      console.error('❌ Exception in getHouseMembers:', error);
      return [];
    }
  },

  async createLink(linkData: CreateLinkData): Promise<CoreLink> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      console.log('LinksService.createLink - userData:', userData.user.id);
      console.log('LinksService.createLink - linkData:', linkData);

      // Try to insert without house_id first since there's a constraint mismatch
      const { data, error } = await supabase
        .from('core_links')
        .insert({
          from_user_id: userData.user.id,
          to_user_id: linkData.to_user_id,
          title: linkData.title,
          description: linkData.description || null,
          contact_name: linkData.contact_name,
          contact_phone: linkData.contact_phone,
          contact_email: linkData.contact_email || null,
          urgency: linkData.urgency,
          status: 'open',
        })
        .select()
        .single();

      if (error) {
        console.error('LinksService.createLink - error:', error);
        throw error;
      }
      
      console.log('LinksService.createLink - success:', data);
      return data;
    } catch (error) {
      console.error('LinksService.createLink - exception:', error);
      throw error;
    }
  },

  async getMyLinks(): Promise<CoreLink[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('core_links')
      .select('*')
      .or(`from_user_id.eq.${userData.user.id},to_user_id.eq.${userData.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserHouses(): Promise<any[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn('User not authenticated when loading houses');
        return [];
      }

      console.log('Loading houses for user:', userData.user.id);

      // Get user's house_id from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('house_id')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        return [];
      }

      if (!profileData) {
        console.warn('⚠️ No profile found for user');
        return [];
      }

      if (!profileData.house_id) {
        console.warn('⚠️ User has no house_id assigned');
        return [];
      }

      console.log('✅ Found house_id:', profileData.house_id);

      // Fetch house details from houses table
      const { data: houseData, error: houseError } = await supabase
        .from('houses')
        .select('id, name, state, zone')
        .eq('id', profileData.house_id)
        .maybeSingle();

      if (houseError) {
        console.error('❌ Error fetching house:', houseError);
        return [];
      }

      if (!houseData) {
        console.warn('⚠️ No house found with id:', profileData.house_id);
        return [];
      }

      console.log('✅ Loaded house:', houseData.name);

      // Map to expected format
      return [{
        id: houseData.id,
        house_name: houseData.name,
        city: houseData.zone,
        state: houseData.state,
        country: '',
      }];
    } catch (error) {
      console.error('❌ Exception in getUserHouses:', error);
      return [];
    }
  },

  async updateLinkStatus(linkId: string, status: 'open' | 'closed'): Promise<void> {
    const { error } = await supabase
      .from('core_links')
      .update({ status })
      .eq('id', linkId);

    if (error) throw error;
  },

  async getLinksGivenCount(): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn('⚠️ No authenticated user for getLinksGivenCount');
        return 0;
      }

      console.log('📊 Fetching links given count for user:', userData.user.id);
      const { count, error } = await supabase
        .from('core_links')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', userData.user.id);

      if (error) {
        console.error('❌ Error fetching links given count:', error);
        return 0;
      }

      console.log('✅ Links given count:', count);
      return count || 0;
    } catch (error) {
      console.error('❌ LinksService.getLinksGivenCount - exception:', error);
      return 0;
    }
  },

  async getLinksReceivedCount(): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn('⚠️ No authenticated user for getLinksReceivedCount');
        return 0;
      }

      console.log('📊 Fetching links received count for user:', userData.user.id);
      const { count, error } = await supabase
        .from('core_links')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', userData.user.id);

      if (error) {
        console.error('❌ Error fetching links received count:', error);
        return 0;
      }

      console.log('✅ Links received count:', count);
      return count || 0;
    } catch (error) {
      console.error('❌ LinksService.getLinksReceivedCount - exception:', error);
      return 0;
    }
  }
};
