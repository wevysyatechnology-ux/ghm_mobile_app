import { supabase } from './supabase';
import type { DashboardMetrics } from '../types/database';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const [innerCircle, openCircle, activeMemberships, expiredMemberships, houses, probation, categoryOpen, removalEligible] =
      await Promise.all([
        supabase.from('users_profile').select('id', { count: 'exact', head: true }).eq('vertical_type', 'inner_circle'),
        supabase.from('users_profile').select('id', { count: 'exact', head: true }).eq('vertical_type', 'open_circle'),
        supabase.from('core_memberships').select('id', { count: 'exact', head: true }).eq('membership_status', 'active'),
        supabase.from('core_memberships').select('id', { count: 'exact', head: true }).eq('membership_status', 'expired'),
        supabase.from('core_houses').select('id', { count: 'exact', head: true }),
        supabase.from('users_profile').select('id', { count: 'exact', head: true }).eq('attendance_status', 'probation'),
        supabase.from('users_profile').select('id', { count: 'exact', head: true }).eq('attendance_status', 'category_open'),
        supabase
          .from('users_profile')
          .select('id', { count: 'exact', head: true })
          .eq('attendance_status', 'removal_eligible'),
      ]);

    return {
      total_inner_circle: innerCircle.count || 0,
      total_open_circle: openCircle.count || 0,
      active_memberships: activeMemberships.count || 0,
      expired_memberships: expiredMemberships.count || 0,
      total_houses: houses.count || 0,
      members_on_probation: probation.count || 0,
      members_category_open: categoryOpen.count || 0,
      members_removal_eligible: removalEligible.count || 0,
    };
  },
};
