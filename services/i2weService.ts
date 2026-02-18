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
    const currentUserId = userData?.user?.id;

    try {
      // Query profiles table directly for house members with their profile data
      console.log('Fetching profiles for house_id:', houseId, 'currentUserId:', currentUserId);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          zone
        `)
        .eq('house_id', houseId);

      if (profilesError) {
        console.error('Error fetching profiles with house_id:', profilesError);
        throw profilesError;
      }

      console.log('Profiles found:', profilesData?.length || 0, 'profiles:', profilesData);

      if (!profilesData || profilesData.length === 0) {
        console.log('No members found for house:', houseId);
        return [];
      }

      // Filter out current user and get their IDs
      const otherMembers = profilesData.filter((p: any) => p.id !== currentUserId);
      const userIds = otherMembers.map((p: any) => p.id);

      console.log('User IDs after filtering current user:', userIds);

      if (userIds.length === 0) {
        console.log('No other members in house after filtering current user');
        return [];
      }

      // Fetch additional details from users_profile table if available
      const { data: userProfiles } = await supabase
        .from('users_profile')
        .select('id, full_name, phone_number, business_category, city')
        .in('id', userIds);

      console.log('User profiles found in users_profile:', userProfiles?.length || 0);

      // Create a map of users_profile data
      const profileMap = new Map((userProfiles || []).map((p: any) => [p.id, p]));

      // Merge data from both tables, preferring users_profile when available
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

      console.log(`Loaded ${sortedProfiles.length} members for house ${houseId}`, sortedProfiles);
      return sortedProfiles;
    } catch (error) {
      console.error('Error in getHouseMembers:', error);
      throw error;
    }
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
