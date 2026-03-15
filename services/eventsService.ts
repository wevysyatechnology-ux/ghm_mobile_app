/**
 * 📅 Events Service
 * Fetches house event meetings from the `events` table
 */

import { supabase } from '@/lib/supabase';

export interface EventMeeting {
  id: string;
  title: string | null;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string;
  meeting_link: string | null;
  event_level: string;
  house_id: string | null;
  created_at: string;
}

export class EventsService {
  /**
   * Fetch all events ordered by date
   */
  static async getAllEvents(): Promise<EventMeeting[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch upcoming events (today and future)
   */
  static async getUpcomingEvents(): Promise<EventMeeting[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch completed / past events
   */
  static async getCompletedEvents(): Promise<EventMeeting[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('event_date', today)
      .order('event_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch a single event by id
   */
  static async getEventById(id: string): Promise<EventMeeting | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }
}
