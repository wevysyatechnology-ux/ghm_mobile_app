import { supabase } from '@/lib/supabase';
import { CoreLink, UserProfile } from '@/types/database';

export interface CreateLinkData {
  to_user_id: string;
  house_id: string;
  title: string;
  description?: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  urgency: number;
}

export const LinksService = {
  async getHouseMembers(houseId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('core_house_members')
      .select(`
        user_id,
        users_profile (
          id,
          full_name,
          phone_number,
          business_category,
          city
        )
      `)
      .eq('house_id', houseId);

    if (error) throw error;

    return data
      .map((item: any) => item.users_profile)
      .filter((profile: any) => profile !== null);
  },

  async createLink(linkData: CreateLinkData): Promise<CoreLink> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('core_links')
      .insert({
        from_user_id: userData.user.id,
        to_user_id: linkData.to_user_id,
        house_id: linkData.house_id,
        title: linkData.title,
        description: linkData.description,
        contact_name: linkData.contact_name,
        contact_phone: linkData.contact_phone,
        contact_email: linkData.contact_email,
        urgency: linkData.urgency,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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

    const { data, error } = await supabase
      .from('core_house_members')
      .select(`
        house_id,
        core_houses (
          id,
          house_name,
          city,
          state,
          country
        )
      `)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return data?.map((item: any) => item.core_houses) || [];
  },

  async updateLinkStatus(linkId: string, status: 'open' | 'closed'): Promise<void> {
    const { error } = await supabase
      .from('core_links')
      .update({ status })
      .eq('id', linkId);

    if (error) throw error;
  },
};
