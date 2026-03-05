// Supabase Edge Function for secure Deepgram transcription
// Deploy with: supabase functions deploy transcribe
// Environment variables needed: DEEPGRAM_API_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');

if (!deepgramApiKey) {
  throw new Error('Missing DEEPGRAM_API_KEY environment variable');
}

// CORS headers for browser clients
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
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
    // Get multipart form data
    const formData = await req.formData();
    const audioFile = formData.get('file');
    const language = (formData.get('language') || 'en') as string;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: file field is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate language (basic validation)
    if (language.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid language parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Deepgram API specific parameters
    const url = new URL('https://api.deepgram.com/v1/listen');
    url.searchParams.append('model', 'nova-2');
    url.searchParams.append('smart_format', 'true');
    // Deepgram currently prefers standard language codes (e.g. 'en', 'hi', etc.)
    url.searchParams.append('language', language);

    // Call Deepgram API
    // We can send the raw file directly in the body
    const deepgramResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': (audioFile as File).type || 'audio/m4a',
      },
      body: audioFile,
    });

    if (!deepgramResponse.ok) {
      let errorMessage = `Deepgram API error: ${deepgramResponse.status}`;

      try {
        const errorText = await deepgramResponse.text();
        errorMessage = `Deepgram API error: ${deepgramResponse.status} - ${errorText}`;
      } catch {
        // Use default message
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: deepgramResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const data = await deepgramResponse.json();

    // Extract transcript from Deepgram response
    let transcript = '';
    try {
      transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';
    } catch (e) {
      console.error("Error parsing deepgram response:", e);
    }

    // Return transcription (same format as before for frontend compatibility)
    return new Response(
      JSON.stringify({
        text: transcript,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Transcribe function error:', error);

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
