import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

interface NotificationRequest {
  userId?: string;
  userIds?: string[];
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

serve(async (req: Request) => {
  const headers = corsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }

  try {
    const payload = (await req.json()) as NotificationRequest;

    if (!payload.type || !payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: 'type, title, and body are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    }

    const targetUserIds = payload.userId
      ? [payload.userId]
      : payload.userIds || [];

    if (targetUserIds.length === 0) {
      return new Response(JSON.stringify({ error: 'userId or userIds required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    }

    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('user_id, expo_push_token')
      .in('user_id', targetUserIds);

    if (tokenError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch push tokens', details: tokenError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    }

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('user_id, push_enabled')
      .in('user_id', targetUserIds);

    const enabledUserIds = new Set(
      (preferences || [])
        .filter((p: any) => p.push_enabled !== false)
        .map((p: any) => p.user_id)
    );

    const validTokens = (tokens || [])
      .filter((token: any) => enabledUserIds.size === 0 || enabledUserIds.has(token.user_id))
      .filter((token: any) =>
        typeof token.expo_push_token === 'string' &&
        (token.expo_push_token.startsWith('ExponentPushToken[') || token.expo_push_token.startsWith('ExpoPushToken['))
      );

    let expoResult: unknown = { skipped: true };

    if (validTokens.length > 0) {
      const messages = validTokens.map((token: any) => ({
        to: token.expo_push_token,
        sound: payload.sound || 'default',
        title: payload.title,
        body: payload.body,
        data: {
          type: payload.type,
          ...(payload.data || {}),
        },
        priority: payload.priority || 'high',
        channelId: payload.channelId || 'default',
      }));

      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });

      if (!expoResponse.ok) {
        const text = await expoResponse.text();
        return new Response(JSON.stringify({ error: 'Failed to send mobile push notification', details: text }), {
          status: expoResponse.status,
          headers: { 'Content-Type': 'application/json', ...headers },
        });
      }

      expoResult = await expoResponse.json();
    }

    const notificationRows = targetUserIds.map((userId) => ({
      user_id: userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      read: false,
      created_at: new Date().toISOString(),
      delivery_status: validTokens.length > 0 ? 'sent' : 'pending',
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationRows);

    if (insertError) {
      console.error('Failed to save notifications:', insertError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: validTokens.length,
        details: expoResult,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...headers },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...headers },
      }
    );
  }
});
