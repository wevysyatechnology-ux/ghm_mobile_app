import { supabase } from '@/lib/supabase';
import { CoreI2WE, UserProfile } from '@/types/database';

export interface CreateMeetingData {
  member_2_id: string;
  house_id: string;
  meeting_date: string;
  notes?: string;
}

export const I2WEService = {
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

  async createMeeting(meetingData: CreateMeetingData): Promise<CoreI2WE> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('core_i2we')
      .insert({
        member_1_id: userData.user.id,
        member_2_id: meetingData.member_2_id,
        house_id: meetingData.house_id,
        meeting_date: meetingData.meeting_date,
        notes: meetingData.notes,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
};
