import { supabase } from './supabase';
import type { AttendanceRecordStatus } from '../types/database';

export const attendanceService = {
  async getAttendanceByHouse(houseId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance_records')
      .select('*, users_profile(*), core_houses(*)')
      .eq('house_id', houseId)
      .order('meeting_date', { ascending: false });

    if (startDate) {
      query = query.gte('meeting_date', startDate);
    }
    if (endDate) {
      query = query.lte('meeting_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAllAttendanceRecords() {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, users_profile(*), core_houses(*)')
      .order('meeting_date', { ascending: false })
      .limit(1000);

    if (error) throw error;
    return data || [];
  },

  async getMembersWithAttendanceIssues() {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*, core_house_members!core_house_members_user_id_fkey(house_id, core_houses(*))')
      .in('attendance_status', ['probation', 'category_open', 'removal_eligible'])
      .eq('vertical_type', 'inner_circle')
      .order('absence_count', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAttendance(
    houseId: string,
    userId: string,
    meetingDate: string,
    status: AttendanceRecordStatus,
    notes?: string
  ) {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(
        {
          house_id: houseId,
          user_id: userId,
          meeting_date: meetingDate,
          status,
          marked_by: currentUser.data.user.id,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'house_id,user_id,meeting_date' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkMarkAttendance(
    houseId: string,
    meetingDate: string,
    attendanceList: { userId: string; status: AttendanceRecordStatus }[]
  ) {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) throw new Error('Not authenticated');

    const records = attendanceList.map((item) => ({
      house_id: houseId,
      user_id: item.userId,
      meeting_date: meetingDate,
      status: item.status,
      marked_by: currentUser.data.user!.id,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(records, { onConflict: 'house_id,user_id,meeting_date' })
      .select();

    if (error) throw error;
    return data;
  },

  async getAttendanceForDate(houseId: string, meetingDate: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, users_profile(*)')
      .eq('house_id', houseId)
      .eq('meeting_date', meetingDate);

    if (error) throw error;
    return data || [];
  },
};
