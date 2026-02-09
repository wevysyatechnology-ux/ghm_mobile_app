import { supabase } from '@/lib/supabase';
import { CoreDeal, DealParticipant } from '@/types/database';

export interface CreateDealData {
  title: string;
  description?: string;
  amount: number;
  deal_type: 'house_deal' | 'wevysya_deal';
  house_id?: string;
}

export const DealsService = {
  async createDeal(dealData: CreateDealData): Promise<CoreDeal> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('core_deals')
      .insert({
        creator_id: userData.user.id,
        title: dealData.title,
        description: dealData.description,
        amount: dealData.amount,
        deal_type: dealData.deal_type,
        house_id: dealData.house_id || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('deal_participants')
      .insert({
        deal_id: data.id,
        user_id: userData.user.id,
        role: 'creator',
      });

    return data;
  },

  async getHouseDeals(houseId: string): Promise<CoreDeal[]> {
    const { data, error } = await supabase
      .from('core_deals')
      .select('*')
      .eq('deal_type', 'house_deal')
      .eq('house_id', houseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWeVysyaDeals(): Promise<CoreDeal[]> {
    const { data, error } = await supabase
      .from('core_deals')
      .select('*')
      .eq('deal_type', 'wevysya_deal')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMyDeals(): Promise<CoreDeal[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('deal_participants')
      .select(`
        deal_id,
        core_deals (*)
      `)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return data?.map((item: any) => item.core_deals) || [];
  },

  async joinDeal(dealId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('deal_participants')
      .insert({
        deal_id: dealId,
        user_id: userData.user.id,
        role: 'participant',
      });

    if (error) throw error;
  },

  async leaveDeal(dealId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('deal_participants')
      .delete()
      .eq('deal_id', dealId)
      .eq('user_id', userData.user.id)
      .neq('role', 'creator');

    if (error) throw error;
  },

  async getDealParticipants(dealId: string): Promise<DealParticipant[]> {
    const { data, error } = await supabase
      .from('deal_participants')
      .select('*')
      .eq('deal_id', dealId);

    if (error) throw error;
    return data || [];
  },

  async updateDealStatus(
    dealId: string,
    status: 'open' | 'in_progress' | 'completed' | 'closed'
  ): Promise<void> {
    const { error } = await supabase
      .from('core_deals')
      .update({ status })
      .eq('id', dealId);

    if (error) throw error;
  },
};
