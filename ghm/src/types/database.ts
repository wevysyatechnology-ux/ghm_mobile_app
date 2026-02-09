export type AdminRole =
  | 'global_president'
  | 'global_vice_president'
  | 'global_support'
  | 'state_president'
  | 'zonal_president'
  | 'house_president'
  | 'secretary'
  | 'treasurer'
  | 'manager'
  | 'accounts_assistant'
  | 'membership_committee_chairman';

export type AttendanceStatus = 'normal' | 'probation' | 'category_open' | 'removal_eligible';
export type AttendanceRecordStatus = 'present' | 'absent';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalRequestType =
  | 'category_opening'
  | 'member_removal'
  | 'role_assignment'
  | 'membership_change'
  | 'suspension';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string | null;
  vertical_type: 'inner_circle' | 'open_circle' | null;
  country: string | null;
  state: string | null;
  city: string | null;
  business_category: string | null;
  admin_role: AdminRole | null;
  attendance_status: AttendanceStatus;
  absence_count: number;
  is_suspended: boolean;
  created_at: string;
}

export interface CoreHouse {
  id: string;
  house_name: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
}

export interface CoreHouseMember {
  id: string;
  user_id: string;
  house_id: string;
  role: string | null;
  created_at: string;
}

export interface CoreMembership {
  id: string;
  user_id: string;
  membership_type: 'regular' | 'privileged';
  membership_status: 'active' | 'expired' | 'suspended';
  valid_from: string;
  valid_to: string | null;
  financial_year: string;
  created_at: string;
}

export interface VirtualMembership {
  id: string;
  user_id: string;
  membership_status: 'active' | 'expired';
  valid_from: string;
  valid_to: string;
  financial_year: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  house_id: string;
  user_id: string;
  meeting_date: string;
  status: AttendanceRecordStatus;
  marked_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  request_type: ApprovalRequestType;
  subject_user_id: string;
  requested_by: string;
  status: ApprovalStatus;
  remarks: string | null;
  metadata: Record<string, any> | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action_type: string;
  performed_by: string;
  target_type: string;
  target_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface MemberWithDetails extends UserProfile {
  house?: CoreHouse;
  membership?: CoreMembership | VirtualMembership;
  house_role?: string | null;
}

export interface HouseWithStats extends CoreHouse {
  total_members: number;
  active_members: number;
}

export interface DashboardMetrics {
  total_inner_circle: number;
  total_open_circle: number;
  active_memberships: number;
  expired_memberships: number;
  total_houses: number;
  members_on_probation: number;
  members_category_open: number;
  members_removal_eligible: number;
}
