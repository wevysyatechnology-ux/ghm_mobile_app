import { supabase } from './supabase';
import type { ApprovalRequestType } from '../types/database';

export const approvalsService = {
  async getAllApprovals() {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(
        `
        *,
        subject_user:users_profile!approval_requests_subject_user_id_fkey(*),
        requester:users_profile!approval_requests_requested_by_fkey(full_name),
        approver:users_profile!approval_requests_approved_by_fkey(full_name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPendingApprovals() {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(
        `
        *,
        subject_user:users_profile!approval_requests_subject_user_id_fkey(*),
        requester:users_profile!approval_requests_requested_by_fkey(full_name),
        approver:users_profile!approval_requests_approved_by_fkey(full_name)
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createApprovalRequest(
    requestType: ApprovalRequestType,
    subjectUserId: string,
    metadata?: Record<string, any>
  ) {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('approval_requests')
      .insert({
        request_type: requestType,
        subject_user_id: subjectUserId,
        requested_by: currentUser.data.user.id,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveRequest(approvalId: string, remarks?: string) {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('approval_requests')
      .update({
        status: 'approved',
        approved_by: currentUser.data.user.id,
        approved_at: new Date().toISOString(),
        remarks: remarks || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectRequest(approvalId: string, remarks: string) {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        approved_by: currentUser.data.user.id,
        approved_at: new Date().toISOString(),
        remarks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
