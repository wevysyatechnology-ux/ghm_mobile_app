import { supabase } from '@/lib/supabase';

export interface QRAttendancePayload {
  raw: string;
  token?: string;
  eventId?: string;
  houseId?: string;
  eventName?: string;
}

export interface ResolvedAttendanceContext {
  eventId: string;
  houseId: string | null;
  eventName: string;
  meetingDate: string;
  isLive: boolean;
  qrExpiresAt: string | null;
  eventTime: string | null;
  maxLateMinutes: number;
}

export interface MemberAttendanceProfile {
  approvalStatus: string | null;
  houseId: string | null;
}

export interface AttendanceSubmitResult {
  result: 'marked' | 'already';
  status: 'present' | 'late' | 'absent';
}

function decodeBase64Url(input: string): string | null {
  try {
    let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) normalized += '=';

    if (typeof globalThis.atob === 'function') {
      return globalThis.atob(normalized);
    }

    return null;
  } catch {
    return null;
  }
}

function tryParseToken(token: string): Partial<QRAttendancePayload> {
  // JWT payload support
  if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const decoded = decodeBase64Url(parts[1]);
      if (decoded) {
        try {
          const parsed = JSON.parse(decoded) as Record<string, any>;
          return {
            eventId: parsed.eventId || parsed.event_id,
            houseId: parsed.houseId || parsed.house_id,
            eventName: parsed.eventName || parsed.event_name,
          };
        } catch {
          // Ignore malformed token payloads.
        }
      }
    }
  }

  // Base64 JSON support
  const decoded = decodeBase64Url(token);
  if (decoded) {
    try {
      const parsed = JSON.parse(decoded) as Record<string, any>;
      return {
        eventId: parsed.eventId || parsed.event_id,
        houseId: parsed.houseId || parsed.house_id,
        eventName: parsed.eventName || parsed.event_name,
      };
    } catch {
      return {};
    }
  }

  return {};
}

export class AttendanceService {
  static parseQrPayload(rawValue: string): QRAttendancePayload {
    const raw = (rawValue || '').trim();
    const payload: QRAttendancePayload = { raw };

    if (!raw) return payload;

    // JSON payload support
    try {
      const parsed = JSON.parse(raw) as Record<string, any>;
      payload.token = parsed.token;
      payload.eventId = parsed.eventId || parsed.event_id;
      payload.houseId = parsed.houseId || parsed.house_id;
      payload.eventName = parsed.eventName || parsed.event_name;

      if (payload.token) {
        Object.assign(payload, tryParseToken(payload.token));
      }
      return payload;
    } catch {
      // Not JSON, continue with URL parsing.
    }

    // URL payload support
    try {
      const url = new URL(raw);
      const token = url.searchParams.get('token') || undefined;
      const eventId =
        url.searchParams.get('eventId') ||
        url.searchParams.get('event_id') ||
        undefined;
      const houseId =
        url.searchParams.get('houseId') ||
        url.searchParams.get('house_id') ||
        undefined;

      payload.token = token;
      payload.eventId = eventId;
      payload.houseId = houseId;
      payload.eventName =
        url.searchParams.get('eventName') ||
        url.searchParams.get('event_name') ||
        undefined;

      if (token) {
        Object.assign(payload, tryParseToken(token));
      }
      return payload;
    } catch {
      // Not a URL; continue.
    }

    // Raw token fallback
    if (raw.includes('token=')) {
      const token = raw.split('token=')[1]?.split('&')[0];
      if (token) {
        payload.token = decodeURIComponent(token);
        Object.assign(payload, tryParseToken(payload.token));
      }
      return payload;
    }

    // Direct token scan
    payload.token = raw;
    Object.assign(payload, tryParseToken(raw));

    return payload;
  }

  static async resolveAttendanceContext(
    parsed: QRAttendancePayload
  ): Promise<ResolvedAttendanceContext | null> {
    const baseSelect =
      'id, title, event_date, event_time, max_late_minutes, is_live, qr_expires_at, house_id';

    let event: any = null;

    if (parsed.token) {
      const byToken = await supabase
        .from('events')
        .select(baseSelect)
        .eq('qr_token', parsed.token)
        .maybeSingle();

      if (!byToken.error && byToken.data) {
        event = byToken.data;
      }
    }

    if (!event && parsed.eventId) {
      const byId = await supabase
        .from('events')
        .select(baseSelect)
        .eq('id', parsed.eventId)
        .maybeSingle();

      if (!byId.error && byId.data) {
        event = byId.data;
      }
    }

    if (!event) {
      return null;
    }

    return {
      eventId: event.id,
      houseId: event.house_id || parsed.houseId || null,
      eventName: parsed.eventName || event.title || 'Event Attendance',
      meetingDate: event.event_date,
      isLive: Boolean(event.is_live),
      qrExpiresAt: event.qr_expires_at || null,
      eventTime: event.event_time || null,
      maxLateMinutes: Number(event.max_late_minutes || 0),
    };
  }

  static async getMemberAttendanceProfile(
    userId: string
  ): Promise<MemberAttendanceProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('approval_status, house_id')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      approvalStatus: data.approval_status || null,
      houseId: data.house_id || null,
    };
  }

  static async submitAttendance(params: {
    userId: string;
    eventId: string;
    eventTime: string | null;
    maxLateMinutes: number;
  }): Promise<AttendanceSubmitResult> {
    const existing = await supabase
      .from('event_attendance')
      .select('id, status')
      .eq('event_id', params.eventId)
      .eq('member_id', params.userId)
      .maybeSingle();

    if (!existing.error && existing.data) {
      return {
        result: 'already',
        status: (existing.data.status || 'present') as 'present' | 'late' | 'absent',
      };
    }

    let attendStatus: 'present' | 'late' = 'present';
    if (params.eventTime && params.maxLateMinutes > 0) {
      const [h, m] = params.eventTime.split(':').map(Number);
      const now = new Date();
      const eventStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        h,
        m,
        0
      );
      const graceEnd = new Date(
        eventStart.getTime() + params.maxLateMinutes * 60 * 1000
      );
      if (new Date() > graceEnd) {
        attendStatus = 'late';
      }
    }

    const insertResult = await supabase.from('event_attendance').insert({
      event_id: params.eventId,
      member_id: params.userId,
      status: attendStatus,
      check_in_method: 'qr',
    });

    if (insertResult.error) {
      if (insertResult.error.code === '23505') {
        return {
          result: 'already',
          status: attendStatus,
        };
      }

      // Compatibility fallback for environments without event_attendance.
      const legacyResult = await supabase.from('attendance').insert({
        event_name: 'Event Attendance',
        member_id: params.userId,
        marked_by: params.userId,
      });

      if (legacyResult.error) {
        throw insertResult.error;
      }

      return {
        result: 'marked',
        status: 'present',
      };
    }

    return {
      result: 'marked',
      status: attendStatus,
    };
  }
}
