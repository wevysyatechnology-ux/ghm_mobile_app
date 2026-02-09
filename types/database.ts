export type VerticalType = 'inner_circle' | 'open_circle';
export type MembershipType = 'regular' | 'privileged';
export type MembershipStatus = 'active' | 'expired' | 'suspended';
export type LinkStatus = 'open' | 'closed';
export type AttendanceStatus = 'normal' | 'probation' | 'category_open' | 'removal_eligible';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string | null;
  vertical_type: VerticalType | null;
  country: string | null;
  state: string | null;
  city: string | null;
  business_category: string | null;
  attendance_status: AttendanceStatus;
  absence_count: number;
  is_suspended: boolean;
  created_at: string;
}

export interface CoreMembership {
  id: string;
  user_id: string;
  membership_type: MembershipType;
  membership_status: MembershipStatus;
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

export interface CoreLink {
  id: string;
  from_user_id: string;
  to_user_id: string;
  title: string;
  description: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  urgency: number;
  house_id: string;
  status: LinkStatus;
  created_at: string;
}

export interface CoreDeal {
  id: string;
  creator_id: string;
  house_id: string | null;
  title: string;
  description: string | null;
  amount: number;
  deal_type: 'house_deal' | 'wevysya_deal';
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  created_at: string;
}

export interface DealParticipant {
  id: string;
  deal_id: string;
  user_id: string;
  role: 'creator' | 'participant';
  joined_at: string;
}

export interface CoreI2WE {
  id: string;
  member_1_id: string;
  member_2_id: string;
  house_id: string;
  meeting_date: string;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelPost {
  id: string;
  channel_id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: string;
  metadata: Record<string, any>;
  status: 'active' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
}
