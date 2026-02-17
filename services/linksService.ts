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
    // Get current user to exclude them from the list
    const { data: userData } = await supabase.auth.getUser();
    
    // Query profiles table to get all users with matching house_id and full_name
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('house_id', houseId)
      .neq('id', userData?.user?.id || ''); // Exclude current user

    if (profilesError) {
      console.error('Error fetching profiles with house_id:', profilesError);
      throw profilesError;
    }

    if (!profilesData || profilesData.length === 0) {
      return [];
    }

    // Extract user IDs and create a map of profile full_names
    const userIds = profilesData.map((p: any) => p.id);
    const profileFullNames = new Map(profilesData.map((p: any) => [p.id, p.full_name]));

    // Fetch user details from users_profile table
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('users_profile')
      .select('id, full_name, phone_number, business_category, city')
      .in('id', userIds);

    if (userProfilesError) {
      console.error('Error fetching user profiles:', userProfilesError);
      throw userProfilesError;
    }

    // Merge and use profile full_name as fallback
    const mergedProfiles = (userProfiles || []).map((profile: any) => ({
      ...profile,
      full_name: (profile.full_name && profile.full_name.trim()) 
        ? profile.full_name 
        : (profileFullNames.get(profile.id) || profile.full_name || 'Unknown')
    }));

    // Sort by full_name
    mergedProfiles.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    return mergedProfiles;
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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    // Get user's house_id from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('house_id')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    if (!profileData || !profileData.house_id) {
      return [];
    }

    // Fetch house details from houses table
    const { data: houseData, error: houseError } = await supabase
      .from('houses')
      .select('id, name, state, zone')
      .eq('id', profileData.house_id)
      .maybeSingle();

    if (houseError) {
      console.error('Error fetching house:', houseError);
      throw houseError;
    }

    if (!houseData) {
      return [];
    }

    // Map to expected format
    return [{
      id: houseData.id,
      house_name: houseData.name,
      city: houseData.zone,
      state: houseData.state,
      country: '',
    }];
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
      if (!userData.user) return 0;

      const { count, error } = await supabase
        .from('core_links')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', userData.user.id);

      if (error) {
        console.error('Error fetching links given count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('LinksService.getLinksGivenCount - exception:', error);
      return 0;
    }
  },

  async getLinksReceivedCount(): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return 0;

      const { count, error } = await supabase
        .from('core_links')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', userData.user.id);

      if (error) {
        console.error('Error fetching links received count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('LinksService.getLinksReceivedCount - exception:', error);
      return 0;
    }
  },
};
