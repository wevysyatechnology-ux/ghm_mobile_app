import { supabase } from '@/lib/supabase';
import { CoreI2WE, UserProfile } from '@/types/database';

export interface CreateMeetingData {
  member_2_id: string;
  meeting_date: string;
  notes?: string;
}

export const I2WEService = {
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

  async createMeeting(meetingData: CreateMeetingData): Promise<CoreI2WE> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get authenticated user's house_id from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('house_id')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user house_id:', profileError);
        throw new Error('Failed to get user house information');
      }

      if (!profileData?.house_id) {
        throw new Error('User is not assigned to any house');
      }

      const { data, error } = await supabase
        .from('core_i2we')
        .insert({
          member_1_id: userData.user.id,
          member_2_id: meetingData.member_2_id,
          house_id: profileData.house_id,
          meeting_date: meetingData.meeting_date,
          notes: meetingData.notes || null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('I2WEService.createMeeting - exception:', error);
      throw error;
    }
  },

  async getMyMeetings(): Promise<CoreI2WE[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('core_i2we')
      .select('*')
      .or(`member_1_id.eq.${userData.user.id},member_2_id.eq.${userData.user.id}`)
      .order('meeting_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateMeetingStatus(
    meetingId: string,
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<void> {
    const { error } = await supabase
      .from('core_i2we')
      .update({ status })
      .eq('id', meetingId);

    if (error) throw error;
  },

  async updateMeetingNotes(meetingId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('core_i2we')
      .update({ notes })
      .eq('id', meetingId);

    if (error) throw error;
  },

  async getMeetingsCount(): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return 0;

      // Count meetings where user is member_1
      const { count: count1, error: error1 } = await supabase
        .from('core_i2we')
        .select('*', { count: 'exact', head: true })
        .eq('member_1_id', userData.user.id);

      if (error1) {
        console.error('Error fetching member_1 meetings count:', error1);
        return 0;
      }

      // Count meetings where user is member_2
      const { count: count2, error: error2 } = await supabase
        .from('core_i2we')
        .select('*', { count: 'exact', head: true })
        .eq('member_2_id', userData.user.id);

      if (error2) {
        console.error('Error fetching member_2 meetings count:', error2);
        return 0;
      }

      return (count1 || 0) + (count2 || 0);
    } catch (error) {
      console.error('I2WEService.getMeetingsCount - exception:', error);
      return 0;
    }
  },
};
