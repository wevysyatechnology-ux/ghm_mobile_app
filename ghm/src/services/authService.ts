import { supabase } from './supabase';
import type { AdminRole, UserProfile } from '../types/database';

const ADMIN_ROLES: AdminRole[] = [
  'global_president',
  'global_vice_president',
  'global_support',
  'state_president',
  'zonal_president',
  'house_president',
  'secretary',
  'treasurer',
  'manager',
  'accounts_assistant',
  'membership_committee_chairman',
];

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async isAdminUser(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile || !profile.admin_role) return false;
    return ADMIN_ROLES.includes(profile.admin_role);
  },

  async checkAdminAccess(userId: string): Promise<{ hasAccess: boolean; profile: UserProfile | null }> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        return { hasAccess: false, profile: null };
      }

      const hasAccess = profile.admin_role !== null && ADMIN_ROLES.includes(profile.admin_role);
      return { hasAccess, profile };
    } catch (error) {
      console.error('Error checking admin access:', error);
      return { hasAccess: false, profile: null };
    }
  },
};
