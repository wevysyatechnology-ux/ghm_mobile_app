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
    const currentUserId = userData?.user?.id;

    try {
      console.log('Fetching profiles via RPC for house_id:', houseId, 'currentUserId:', currentUserId);

      // Call the secure RPC function to bypass RLS on the profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .rpc('get_house_members', { p_house_id: houseId });

      if (profilesError) {
        console.error('Error fetching house members via RPC:', profilesError);
        throw profilesError;
      }

      console.log('Profiles found:', profilesData?.length || 0);

      if (!profilesData || profilesData.length === 0) {
        console.log('No members found for house:', houseId);
        return [];
      }

      // Filter out current user
      const otherMembers = profilesData.filter((p: any) => p.id !== currentUserId);

      console.log('Members after filtering current user:', otherMembers.length);

      // Sort by full_name
      const sortedProfiles = otherMembers.sort((a: any, b: any) =>
        (a.full_name || '').localeCompare(b.full_name || '')
      );

      console.log(`Successfully loaded ${sortedProfiles.length} members for house ${houseId}`);
      return sortedProfiles as UserProfile[];
    } catch (error) {
      console.error('Error in getHouseMembers:', error);
      throw error;
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
