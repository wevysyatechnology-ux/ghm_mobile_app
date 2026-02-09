import { supabase } from './supabase';
import type { CoreHouse, HouseWithStats } from '../types/database';

export const housesService = {
  async getAllHouses(): Promise<HouseWithStats[]> {
    const { data, error } = await supabase.from('core_houses').select('*').order('created_at', { ascending: false });

    if (error) throw error;

    const housesWithStats = await Promise.all(
      (data || []).map(async (house) => {
        const [total, active] = await Promise.all([
          supabase.from('core_house_members').select('id', { count: 'exact', head: true }).eq('house_id', house.id),
          supabase
            .from('core_house_members')
            .select('id, users_profile!core_house_members_user_id_fkey(is_suspended)', { count: 'exact', head: true })
            .eq('house_id', house.id)
            .eq('users_profile.is_suspended', false),
        ]);

        return {
          ...house,
          total_members: total.count || 0,
          active_members: active.count || 0,
        };
      })
    );

    return housesWithStats;
  },

  async getHouseById(houseId: string): Promise<CoreHouse | null> {
    const { data, error } = await supabase.from('core_houses').select('*').eq('id', houseId).maybeSingle();

    if (error) throw error;
    return data;
  },

  async createHouse(house: Omit<CoreHouse, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('core_houses').insert(house).select().single();

    if (error) throw error;
    return data;
  },

  async updateHouse(houseId: string, updates: Partial<CoreHouse>) {
    const { data, error } = await supabase.from('core_houses').update(updates).eq('id', houseId).select().single();

    if (error) throw error;
    return data;
  },

  async getHouseMembers(houseId: string) {
    const { data, error } = await supabase
      .from('core_house_members')
      .select('*, users_profile(*)')
      .eq('house_id', houseId);

    if (error) throw error;
    return data || [];
  },

  async assignMemberToHouse(userId: string, houseId: string, role: string | null = null) {
    const { data, error } = await supabase
      .from('core_house_members')
      .insert({ user_id: userId, house_id: houseId, role })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMemberFromHouse(userId: string, houseId: string) {
    const { error } = await supabase.from('core_house_members').delete().eq('user_id', userId).eq('house_id', houseId);

    if (error) throw error;
  },

  async updateMemberRole(userId: string, houseId: string, role: string) {
    const { data, error } = await supabase
      .from('core_house_members')
      .update({ role })
      .eq('user_id', userId)
      .eq('house_id', houseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
