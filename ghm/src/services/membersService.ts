import { supabase } from './supabase';
import type { UserProfile, MemberWithDetails, AdminRole } from '../types/database';

export const membersService = {
  async getAllMembers(): Promise<MemberWithDetails[]> {
    const { data, error } = await supabase
      .from('users_profile')
      .select(
        `
        *,
        core_house_members!core_house_members_user_id_fkey (
          house_id,
          role,
          core_houses!core_house_members_house_id_fkey (*)
        ),
        core_memberships!core_memberships_user_id_fkey (*)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((member: any) => ({
      ...member,
      house: member.core_house_members?.[0]?.core_houses || null,
      membership: member.core_memberships?.[0] || null,
      house_role: member.core_house_members?.[0]?.role || null,
    }));
  },

  async getMemberById(userId: string): Promise<MemberWithDetails | null> {
    const { data, error } = await supabase
      .from('users_profile')
      .select(
        `
        *,
        core_house_members!core_house_members_user_id_fkey (
          house_id,
          role,
          core_houses!core_house_members_house_id_fkey (*)
        ),
        core_memberships!core_memberships_user_id_fkey (*)
      `
      )
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      house: data.core_house_members?.[0]?.core_houses || null,
      membership: data.core_memberships?.[0] || null,
      house_role: data.core_house_members?.[0]?.role || null,
    };
  },

  async updateMember(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase.from('users_profile').update(updates).eq('id', userId).select().single();

    if (error) throw error;
    return data;
  },

  async suspendMember(userId: string) {
    return this.updateMember(userId, { is_suspended: true });
  },

  async activateMember(userId: string) {
    return this.updateMember(userId, { is_suspended: false });
  },

  async updateVerticalType(userId: string, verticalType: 'inner_circle' | 'open_circle') {
    return this.updateMember(userId, { vertical_type: verticalType });
  },

  async assignAdminRole(userId: string, role: AdminRole | null) {
    return this.updateMember(userId, { admin_role: role });
  },

  async getAttendanceHistory(userId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, core_houses(*)')
      .eq('user_id', userId)
      .order('meeting_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
