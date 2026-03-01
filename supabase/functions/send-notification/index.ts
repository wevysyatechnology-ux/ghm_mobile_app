// Supabase Edge Function for sending push notifications via Expo
// Deploy with: supabase functions deploy send-notification
// Environment variables needed: None (uses Expo's push service)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface NotificationRequest {
  userId?: string; // Single user
  userIds?: string[]; // Multiple users
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

interface ExpoMessage {
  to: string | string[];
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    const payload: NotificationRequest = await req.json();

    // Validate request
    if (!payload.userId && !payload.userIds) {
      return new Response(
        JSON.stringify({ error: 'userId or userIds required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!payload.type || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({
          error: 'type, title, and body are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get user IDs to send to
    const targetUserIds = payload.userId
      ? [payload.userId]
      : payload.userIds || [];

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users to send notification to' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Fetch push tokens for target users
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('user_id, expo_push_token')
      .in('user_id', targetUserIds);

    if (tokensError) {
      console.error('Failed to fetch tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No push tokens found for specified users',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('user_id, push_enabled')
      .in('user_id', targetUserIds);

    // Filter tokens based on preferences
    const enabledUserIds = new Set(
      preferences
        ?.filter((p) => p.push_enabled !== false)
        .map((p) => p.user_id) || []
    );

    const validTokens = tokens.filter(
      (t) => enabledUserIds.has(t.user_id) || enabledUserIds.size === 0
    );

    if (validTokens.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No users have push notifications enabled',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Prepare Expo push messages
    const messages: ExpoMessage[] = validTokens.map((token) => ({
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

    // Send via Expo Push API
    const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
    const expoResponse = await fetch(expoPushUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });

    if (!expoResponse.ok) {
      const errorText = await expoResponse.text();
      console.error('Expo push failed:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to send push notification',
          details: errorText,
        }),
        {
          status: expoResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const expoResult = await expoResponse.json();
    console.log('Expo push result:', expoResult);

    // Save notifications to database
    const notificationRecords = targetUserIds.map((userId) => ({
      user_id: userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      read: false,
      created_at: new Date().toISOString(),
      delivery_status: 'sent',
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationRecords);

    if (insertError) {
      console.error('Failed to save notifications:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: validTokens.length,
        details: expoResult,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
