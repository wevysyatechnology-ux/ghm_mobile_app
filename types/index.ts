export interface User {
  id: string;
  name: string;
  email: string;
  category: string;
  location: string;
  circle: 'inner' | 'open';
  tier: 'regular' | 'privileged' | 'virtual';
  profile_photo?: string;
  is_online: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  type: 'deal' | 'i2we' | 'visitor' | 'meeting' | 'suggestion';
  title: string;
  message: string;
  timestamp: string;
  action_label?: string;
}

export interface AIIntent {
  intent: string;
  screen_to_open?: string;
  message?: string;
  data?: Record<string, any>;
}
